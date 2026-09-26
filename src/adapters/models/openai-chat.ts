import { replayable, requestMessages } from "../../domain/model-messages.ts";
import type {
  ModelContentBlock,
  ModelMessage,
  ModelRequest,
  ModelResult,
} from "../../domain/model.types.ts";
import type { ProtocolContext } from "./model-protocol.types.ts";
import {
  modelResult,
  object,
  requireResponse,
  stopReason,
  toolInput,
} from "./model-response.ts";
import { openaiUsage, toolArguments } from "./openai-usage.ts";
import { CHAT_FINISH_REASONS } from "./stop-reasons.constants.ts";

export function chatBody(
  request: ModelRequest,
  context: ProtocolContext,
): Record<string, unknown> {
  const messages = requestMessages(request).flatMap((message) =>
    chatMessages(message, context),
  );
  return {
    model: context.model,
    messages: [
      ...(request.system === undefined
        ? []
        : [{ role: "system", content: request.system }]),
      ...messages,
    ],
    ...(request.tools?.length
      ? {
          tools: request.tools.map((tool) => ({
            type: "function",
            function: {
              name: tool.name,
              description: tool.description,
              parameters: tool.inputSchema,
            },
          })),
        }
      : {}),
    stream: false,
    store: false,
    ...(request.maxOutputTokens === undefined
      ? {}
      : { max_completion_tokens: request.maxOutputTokens }),
    ...(request.reasoning === undefined
      ? {}
      : { reasoning_effort: request.reasoning }),
  };
}

export function readChatCompletion(value: unknown): ModelResult {
  const data = object(value);
  requireResponse(Array.isArray(data.choices) && data.choices.length === 1);
  const choice = object(data.choices[0]);
  const message = object(choice.message);
  requireResponse(
    message.role === "assistant" && message.function_call == null,
  );
  requireResponse(
    message.content == null || typeof message.content === "string",
  );
  requireResponse(
    message.tool_calls == null || Array.isArray(message.tool_calls),
  );
  const refused = message.refusal != null;
  requireResponse(!refused || typeof message.refusal === "string");
  const reason = refused
    ? "refusal"
    : stopReason(CHAT_FINISH_REASONS, choice.finish_reason);
  const content: ModelContentBlock[] = [
    ...(typeof message.content === "string"
      ? [{ type: "text" as const, text: message.content }]
      : []),
    ...((message.tool_calls as unknown[] | null | undefined) ?? []).map(
      toolCall,
    ),
  ];
  return modelResult(
    content,
    reason,
    openaiUsage(
      data.usage,
      "prompt_tokens",
      "completion_tokens",
      "prompt_tokens_details",
    ),
  );
}

function toolCall(value: unknown): ModelContentBlock {
  const call = object(value);
  const target = object(call.function);
  requireResponse(
    typeof call.id === "string" &&
      call.type === "function" &&
      typeof target.name === "string" &&
      typeof target.arguments === "string",
  );
  return {
    type: "tool-call",
    id: call.id,
    name: target.name,
    input: toolInput(target.arguments),
  };
}

function chatMessages(
  message: ModelMessage,
  context: ProtocolContext,
): readonly Record<string, unknown>[] {
  const blocks = message.content.filter((block) =>
    replayable(block, context.identity, context.model),
  );
  const texts = blocks.flatMap((block) =>
    block.type === "text" ? [block.text] : [],
  );
  const text =
    texts.length === 1
      ? texts[0]!
      : texts.map((value) => ({ type: "text", text: value }));
  if (message.role === "assistant") {
    const calls = blocks.flatMap((block) =>
      block.type === "tool-call"
        ? [
            {
              id: block.id,
              type: "function",
              function: {
                name: block.name,
                arguments: toolArguments(block.input),
              },
            },
          ]
        : [],
    );
    if (!texts.length && !calls.length) return [];
    return [
      {
        role: "assistant",
        content: texts.length ? texts.join("") : null,
        ...(calls.length ? { tool_calls: calls } : {}),
      },
    ];
  }
  return [
    ...blocks.flatMap((block) =>
      block.type === "tool-result"
        ? [{ role: "tool", tool_call_id: block.callId, content: block.content }]
        : [],
    ),
    ...(texts.length ? [{ role: "user", content: text }] : []),
  ];
}
