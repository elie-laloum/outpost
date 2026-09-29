import { toolResult } from "../tool-result.ts";
import type { AgentEvent, Usage } from "../../../domain/agent.types.ts";
import { decodeEvent, decodeLine } from "../event-decoder.ts";
import { asRecord, decodeRecord, numberOrZero } from "../protocol.ts";
import type { EventDecoders, ProtocolRecord } from "../protocol.types.ts";
import { claudeQuotaErrors } from "./claude.constants.ts";

function tokens(value: unknown): Usage {
  const usage = asRecord(value);
  return {
    input: numberOrZero(usage.input_tokens),
    cacheCreated: numberOrZero(usage.cache_creation_input_tokens),
    cached: numberOrZero(usage.cache_read_input_tokens),
    output: numberOrZero(usage.output_tokens),
  };
}

function system(event: ProtocolRecord): AgentEvent[] {
  return typeof event.session_id === "string"
    ? [{ kind: "conversation", id: event.session_id }]
    : [];
}

function rateLimit(event: ProtocolRecord): AgentEvent[] {
  const info = asRecord(event.rate_limit_info);
  if (info.status !== "rejected") return [];
  const reset =
    typeof info.resetsAt === "number" && Number.isSafeInteger(info.resetsAt)
      ? new Date(info.resetsAt * 1000)
      : undefined;
  const limit =
    typeof info.rateLimitType === "string" ? info.rateLimitType : "usage";
  return [
    {
      kind: "quota",
      message: `Claude Code ${limit} limit reached`,
      ...(reset && Number.isFinite(reset.getTime())
        ? { resetAt: reset.toISOString() }
        : {}),
    },
  ];
}

function assistant(event: ProtocolRecord): AgentEvent[] {
  const quota: AgentEvent[] =
    typeof event.error === "string" && claudeQuotaErrors.has(event.error)
      ? [{ kind: "quota", message: `Claude Code reported ${event.error}` }]
      : [];
  const message = asRecord(event.message);
  const content = message.content;
  if (!Array.isArray(content)) return quota;
  const usage: AgentEvent[] = message.usage
    ? [
        {
          kind: "message-usage",
          tokens: tokens(message.usage),
          ...(typeof message.id === "string" ? { messageId: message.id } : {}),
          ...(typeof event.parent_tool_use_id === "string"
            ? { parentCallId: event.parent_tool_use_id }
            : {}),
        },
      ]
    : [];
  return [
    ...quota,
    ...usage,
    ...content.flatMap((part) =>
      decodeEvent(asRecord(part), {
        text: (block) =>
          typeof block.text === "string"
            ? [{ kind: "text", text: block.text }]
            : [],
        thinking: (block) =>
          typeof block.thinking === "string"
            ? [{ kind: "reasoning", text: block.thinking }]
            : [],
        tool_result: (block) =>
          toolResult(
            block.tool_use_id,
            undefined,
            block.content,
            block.is_error === true,
          ).map((value) => ({
            ...value,
            ...(typeof event.parent_tool_use_id === "string"
              ? { parentCallId: event.parent_tool_use_id }
              : {}),
          })),
        tool_use: (block) => [
          {
            kind: "tool",
            name: String(block.name),
            input: block.input,
            ...(typeof block.id === "string" ? { callId: block.id } : {}),
            ...(typeof event.parent_tool_use_id === "string"
              ? { parentCallId: event.parent_tool_use_id }
              : {}),
          },
        ],
      }),
    ),
  ];
}

function result(event: ProtocolRecord): AgentEvent[] {
  const events: AgentEvent[] = [];
  if (!event.is_error && typeof event.result === "string")
    events.push({ kind: "result", text: event.result });
  if (event.usage) events.push({ kind: "usage", tokens: tokens(event.usage) });
  events.push(
    event.is_error
      ? {
          kind: "failure",
          message: String(
            event.result ?? JSON.stringify(event.errors) ?? "Agent failed",
          ),
        }
      : { kind: "finished" },
  );
  return events;
}

export function claudeEvents(line: string): AgentEvent[] {
  return decodeLine(line, {
    system,
    assistant,
    user: (event) => (event.isReplay === true ? [] : assistant(event)),
    stream_event: (event) => {
      const delta = asRecord(asRecord(event.event).delta);
      if (delta.type === "text_delta" && typeof delta.text === "string")
        return [{ kind: "text-delta", text: delta.text }];
      if (delta.type === "thinking_delta" && typeof delta.thinking === "string")
        return [{ kind: "reasoning", text: delta.thinking }];
      return [];
    },
    result,
    rate_limit_event: rateLimit,
  } satisfies EventDecoders);
}

export function claudeTranscriptUsage(text: string): Usage | undefined {
  let usage: Usage | undefined;
  for (const line of text.split(/\r?\n/)) {
    const event = decodeRecord(line);
    if (event?.type !== "assistant") continue;
    const message = asRecord(event.message);
    if (message.usage) usage = tokens(message.usage);
  }
  return usage;
}
