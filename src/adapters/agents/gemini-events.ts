import type { AgentEvent } from "../../domain/agent.types.ts";
import { decodeLine } from "./event-decoder.ts";
import { asRecord, numberOrZero } from "./protocol.ts";
import type { ProtocolRecord } from "./protocol.types.ts";

function message(event: ProtocolRecord): AgentEvent[] {
  if (event.role !== "assistant" || typeof event.content !== "string")
    return [];
  return [{ kind: "text", text: event.content }];
}

function result(event: ProtocolRecord): AgentEvent[] {
  const events: AgentEvent[] = [];
  if (event.stats) {
    const stats = asRecord(event.stats);
    events.push({
      kind: "usage",
      tokens: {
        input: numberOrZero(stats.input_tokens),
        cached: numberOrZero(stats.cached),
        output: numberOrZero(stats.output_tokens),
      },
    });
  }
  if (event.status === "success") events.push({ kind: "finished" });
  if (event.status === "error")
    events.push({
      kind: "failure",
      message: String(asRecord(event.error).message ?? "Gemini failed"),
    });
  return events;
}

export function geminiEvents(line: string): AgentEvent[] {
  return decodeLine(line, {
    init: (event) =>
      typeof event.session_id === "string"
        ? [{ kind: "conversation", id: event.session_id }]
        : [],
    message,
    tool_use: (event) =>
      typeof event.tool_name === "string"
        ? [{ kind: "tool", name: event.tool_name, input: event.parameters }]
        : [],
    error: (event) =>
      typeof event.message === "string"
        ? [
            {
              kind: event.severity === "warning" ? "warning" : "failure",
              message: event.message,
            },
          ]
        : [],
    result,
  });
}
