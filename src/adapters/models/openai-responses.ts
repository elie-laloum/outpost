import { replayable, requestMessages } from "../../domain/model-messages.ts";
import type {
  ModelContentBlock,
  ModelMessage,
  ModelRequest,
  ModelResult,
  ModelStopReason,
} from "../../domain/model.types.ts";
import type { BlockEncoders, ProtocolContext } from "./model-protocol.types.ts";
import {
  modelResult,
  object,
  requireResponse,
  stopReason,
  toolInput,
} from "./model-response.ts";
import { openaiUsage, toolArguments } from "./openai-usage.ts";
import { RESPONSES_INCOMPLETE_REASONS } from "./stop-reasons.constants.ts";

export function responsesBody(
  request: ModelRequest,
  context: ProtocolContext,
): Record<string, unknown> {
  const items = requestMessages(request).flatMap((message) =>
    responseItems(message, context),
  );
  return {
    model: context.model,
    input: request.messages === undefined ? request.prompt : items,
    ...(request.system === undefined ? {} : { instructions: request.system }),
    ...(request.tools?.length
      ? {
          tools: request.tools.map((tool) => ({
            type: "function",
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
          })),
        }
      : {}),
    stream: false,
    store: false,
    ...(request.maxOutputTokens === undefined
      ? {}
      : { max_output_tokens: request.maxOutputTokens }),
    ...(request.reasoning === undefined
      ? {}
      : { reasoning: { effort: request.reasoning } }),
  };
}

export function readModelResponse(
  value: unknown,
  context: ProtocolContext = { identity: "openai", model: "" },
): ModelResult {
  const data = object(value);
  requireResponse(data.error == null && Array.isArray(data.output));
  const incomplete = data.status === "incomplete";
  requireResponse(incomplete || data.status === "completed");
  let refused = false;
  const content = data.output.flatMap((value): ModelContentBlock[] => {
    const item = object(value);
    if (item.type === "reasoning")
      return [
        {
          type: "reasoning",
          provider: context.identity,
          model: context.model,
          data: item,
        },
      ];
    if (item.type === "function_call") return [functionCall(item)];
    requireResponse(item.type === "message" && item.role === "assistant");
    requireResponse(item.status === "completed" || incomplete);
    requireResponse(Array.isArray(item.content));
    return item.content.flatMap((value): ModelContentBlock[] => {
      const part = object(value);
      if (part.type === "refusal") {
        requireResponse(typeof part.refusal === "string");
        refused = true;
        return [];
      }
      requireResponse(
        part.type === "output_text" && typeof part.text === "string",
      );
      return [{ type: "text", text: part.text }];
    });
  });
  const reason = refused ? "refusal" : completion(data, incomplete);
  return modelResult(
    content,
    reason,
    openaiUsage(
      data.usage,
      "input_tokens",
      "output_tokens",
      "input_tokens_details",
    ),
  );
}

function completion(
  data: Record<string, unknown>,
  incomplete: boolean,
): ModelStopReason {
  if (!incomplete) return "end";
  return stopReason(
    RESPONSES_INCOMPLETE_REASONS,
    object(data.incomplete_details).reason,
  );
}

function functionCall(item: Record<string, unknown>): ModelContentBlock {
  requireResponse(
    typeof item.call_id === "string" &&
      typeof item.name === "string" &&
      typeof item.arguments === "string",
  );
  return {
    type: "tool-call",
    id: item.call_id,
    name: item.name,
    input: toolInput(item.arguments),
  };
}

function responseItems(message: ModelMessage, context: ProtocolContext) {
  return message.content
    .filter((block) => replayable(block, context.identity, context.model))
    .toSorted((left, right) => order(message, left) - order(message, right))
    .map((block) => itemEncoders[block.type](block as never, message.role));
}

function order(message: ModelMessage, block: ModelContentBlock): number {
  return message.role === "user" && block.type !== "tool-result" ? 1 : 0;
}

const itemEncoders: BlockEncoders<[role: ModelMessage["role"]]> = {
  text: (block, role) => ({ role, content: block.text }),
  "tool-call": (block) => ({
    type: "function_call",
    call_id: block.id,
    name: block.name,
    arguments: toolArguments(block.input),
  }),
  "tool-result": (block) => ({
    type: "function_call_output",
    call_id: block.callId,
    output: block.content,
  }),
  reasoning: (block) => block.data,
};
