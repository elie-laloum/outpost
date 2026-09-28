import { toolResult } from "./tool-result.ts";
import type { AgentEvent } from "../../domain/agent.types.ts";
import { decodeLine } from "./event-decoder.ts";
import { asRecord } from "./protocol.ts";
import type { EventDecoders, ProtocolRecord } from "./protocol.types.ts";

function toolInput(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function assistant(event: ProtocolRecord): AgentEvent[] {
  const calls = Array.isArray(event.tool_calls) ? event.tool_calls : [];
  const tools = calls.map(asRecord).flatMap((call): AgentEvent[] => {
    const invocation = asRecord(call.function);
    return typeof invocation.name === "string"
      ? [
          {
            kind: "tool",
            name: invocation.name,
            input: toolInput(invocation.arguments),
            ...(typeof call.id === "string" ? { callId: call.id } : {}),
          },
        ]
      : [];
  });
  if (typeof event.reasoning_content === "string" && event.reasoning_content)
    tools.push({ kind: "reasoning", text: event.reasoning_content });
  return typeof event.content === "string" && event.content
    ? [{ kind: "text", text: event.content }, ...tools]
    : tools;
}

const meta: EventDecoders = {
  "session.resume_hint": (event) =>
    typeof event.session_id === "string"
      ? [{ kind: "conversation", id: event.session_id }]
      : [],
  "turn.step.retrying": (event) =>
    typeof event.error_message === "string"
      ? [{ kind: "warning", message: event.error_message }]
      : [],
};

export function kimiEvents(line: string): AgentEvent[] {
  return decodeLine(
    line,
    {
      assistant,
      tool: (event) =>
        toolResult(
          event.tool_call_id,
          event.name,
          event.content,
          event.is_error === true,
        ),
      meta: (event) => {
        const decode =
          typeof event.type === "string" && Object.hasOwn(meta, event.type)
            ? meta[event.type]
            : undefined;
        return decode?.(event) ?? [];
      },
    },
    "role",
  );
}
