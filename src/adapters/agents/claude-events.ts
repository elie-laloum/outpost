import type { AgentEvent, Usage } from "../../domain/agent.types.ts";
import { decodeEvent, decodeLine } from "./event-decoder.ts";
import { asRecord, decodeRecord, numberOrZero } from "./protocol.ts";
import type { EventDecoders, ProtocolRecord } from "./protocol.types.ts";

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

function assistant(event: ProtocolRecord): AgentEvent[] {
  const content = asRecord(event.message).content;
  if (!Array.isArray(content)) return [];
  return content.flatMap((part) =>
    decodeEvent(asRecord(part), {
      text: (block) =>
        typeof block.text === "string"
          ? [{ kind: "text", text: block.text }]
          : [],
      tool_use: (block) => [
        { kind: "tool", name: String(block.name), input: block.input },
      ],
    }),
  );
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
    result,
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
