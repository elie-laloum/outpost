import type {
  ModelContentBlock,
  ModelResult,
} from "../../domain/model.types.ts";
import type { ProtocolContext } from "./model-protocol.types.ts";
import {
  modelResult,
  object,
  requireResponse,
  stopReason,
  tokens,
} from "./model-response.ts";
import { ANTHROPIC_STOP_REASONS } from "./stop-reasons.constants.ts";

const decoders: Readonly<
  Record<
    string,
    (
      block: Record<string, unknown>,
      context: ProtocolContext,
    ) => ModelContentBlock
  >
> = {
  text: (block) => {
    requireResponse(typeof block.text === "string");
    return { type: "text", text: block.text };
  },
  tool_use: (block) => {
    requireResponse(
      typeof block.id === "string" && typeof block.name === "string",
    );
    return {
      type: "tool-call",
      id: block.id,
      name: block.name,
      input: object(block.input),
    };
  },
  thinking: reasoning,
  redacted_thinking: reasoning,
};

export function readAnthropicResponse(
  value: unknown,
  context: ProtocolContext = { identity: "anthropic", model: "" },
): ModelResult {
  const data = object(value);
  requireResponse(data.type === "message" && data.role === "assistant");
  const reason = stopReason(ANTHROPIC_STOP_REASONS, data.stop_reason);
  requireResponse(Array.isArray(data.content));
  const content = data.content.map((value) => {
    const block = object(value);
    requireResponse(
      typeof block.type === "string" && Object.hasOwn(decoders, block.type),
    );
    return decoders[block.type]!(block, context);
  });
  return modelResult(content, reason, usage(data.usage));
}

function reasoning(
  block: Record<string, unknown>,
  context: ProtocolContext,
): ModelContentBlock {
  return {
    type: "reasoning",
    provider: context.identity,
    model: context.model,
    data: block,
  };
}

function usage(value: unknown): ModelResult["usage"] {
  if (value === undefined) return undefined;
  const reported = object(value);
  const cached = tokens(reported.cache_read_input_tokens ?? 0);
  const cacheCreated = tokens(reported.cache_creation_input_tokens ?? 0);
  const input = tokens(reported.input_tokens) + cached + cacheCreated;
  requireResponse(Number.isSafeInteger(input));
  return {
    input,
    cached,
    cacheCreated,
    output: tokens(reported.output_tokens),
  };
}
