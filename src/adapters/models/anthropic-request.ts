import { invariant } from "../../domain/errors.ts";
import { replayable, requestMessages } from "../../domain/model-messages.ts";
import type {
  ModelContentBlock,
  ModelMessage,
  ModelReasoning,
  ModelRequest,
} from "../../domain/model.types.ts";
import { ANTHROPIC_REASONING } from "./anthropic-model-provider.constants.ts";
import type { BlockEncoders, ProtocolContext } from "./model-protocol.types.ts";

const encoders: BlockEncoders = {
  text: (block) => ({ type: "text", text: block.text }),
  "tool-call": (block) => ({
    type: "tool_use",
    id: block.id,
    name: block.name,
    input: block.input,
  }),
  "tool-result": (block) => ({
    type: "tool_result",
    tool_use_id: block.callId,
    content: block.content,
    ...(block.isError ? { is_error: true } : {}),
  }),
  reasoning: (block) => block.data,
};

export function anthropicBody(
  request: ModelRequest,
  context: ProtocolContext,
  cacheSystem: boolean,
): Record<string, unknown> {
  invariant(
    !cacheSystem || !!request.system?.trim(),
    "System cache requires system instructions",
  );
  invariant(
    request.maxOutputTokens !== undefined,
    "Anthropic requests require maxOutputTokens",
  );
  supportedReasoning(request.reasoning);
  const messages = requestMessages(request).flatMap((message) =>
    anthropicMessage(message, context),
  );
  return {
    model: context.model,
    max_tokens: request.maxOutputTokens,
    ...(request.reasoning === undefined
      ? {}
      : ANTHROPIC_REASONING[request.reasoning]),
    ...(request.cache ? { cache_control: { type: "ephemeral" } } : {}),
    stream: false,
    messages:
      request.messages === undefined
        ? [{ role: "user", content: request.prompt }]
        : messages,
    ...(request.tools?.length
      ? {
          tools: request.tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            input_schema: tool.inputSchema,
          })),
        }
      : {}),
    ...(request.system === undefined
      ? {}
      : {
          system: cacheSystem
            ? [
                {
                  type: "text",
                  text: request.system,
                  cache_control: { type: "ephemeral" },
                },
              ]
            : request.system,
        }),
  };
}

export function supportedReasoning(
  reasoning: ModelReasoning | undefined,
): void {
  invariant(
    reasoning === undefined || Object.hasOwn(ANTHROPIC_REASONING, reasoning),
    `Anthropic does not support reasoning "${reasoning}"`,
  );
}

function anthropicMessage(message: ModelMessage, context: ProtocolContext) {
  const blocks = message.content.filter(
    (block) =>
      replayable(block, context.identity, context.model) &&
      (block.type !== "text" || block.text !== ""),
  );
  const ordered =
    message.role === "user"
      ? [
          ...blocks.filter((block) => block.type === "tool-result"),
          ...blocks.filter((block) => block.type !== "tool-result"),
        ]
      : blocks;
  if (ordered.length === 0) return [];
  return [
    {
      role: message.role,
      content: ordered.map((block) =>
        (encoders[block.type] as (value: ModelContentBlock) => unknown)(block),
      ),
    },
  ];
}
