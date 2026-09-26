import type { AgentEvent } from "../../domain/agent.types.ts";
import { decodeLine } from "./event-decoder.ts";
import { asRecord } from "./protocol.ts";
import type { ProtocolRecord } from "./protocol.types.ts";

function message(event: ProtocolRecord): AgentEvent[] {
  const data = asRecord(event.data);
  const requests = Array.isArray(data.toolRequests) ? data.toolRequests : [];
  const tools = requests.map(asRecord).flatMap((request): AgentEvent[] =>
    typeof request.name === "string"
      ? [
          {
            kind: "tool",
            name: request.name,
            input: request.arguments,
            ...(typeof request.toolCallId === "string"
              ? { callId: request.toolCallId }
              : {}),
          },
        ]
      : [],
  );
  return typeof data.content === "string" && data.content
    ? [{ kind: "text", text: data.content }, ...tools]
    : tools;
}

function result(event: ProtocolRecord): AgentEvent[] {
  const conversation: AgentEvent[] =
    typeof event.sessionId === "string"
      ? [{ kind: "conversation", id: event.sessionId }]
      : [];
  if (event.exitCode === 0 && event.outcome !== "blocked")
    return [...conversation, { kind: "finished" }];
  return [
    ...conversation,
    {
      kind: "failure",
      message:
        event.outcome === "blocked"
          ? "GitHub Copilot CLI was blocked before completing the prompt"
          : `GitHub Copilot CLI ended with exit code ${String(event.exitCode ?? "unknown")}`,
    },
  ];
}

export function copilotEvents(line: string): AgentEvent[] {
  return decodeLine(line, {
    "assistant.message": message,
    "session.error": (event) => {
      const data = asRecord(event.data);
      return typeof data.message === "string"
        ? [{ kind: "warning", message: data.message }]
        : [];
    },
    result,
  });
}
