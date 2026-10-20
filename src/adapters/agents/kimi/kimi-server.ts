import type {
  AgentEvent,
  AgentLiveInput,
} from "../../../domain/agent.types.ts";
import { asRecord, decodeRecord } from "../protocol.ts";
import type { ProtocolRecord } from "../protocol.types.ts";
import { toolResult } from "../tool-result.ts";
import { kimiQuotaPatterns } from "./kimi.constants.ts";

export const kimiServerInput: AgentLiveInput = Object.freeze({
  open: () => ({
    encode: (text: string) => `${JSON.stringify({ text })}\n`,
    read(line: string) {
      const event = decodeRecord(line);
      return {
        consumed:
          event?.role === "outpost-server" && event.type === "accepted" ? 1 : 0,
        replies: [],
      };
    },
  }),
});

export function kimiServerEvents(message: ProtocolRecord): AgentEvent[] {
  if (message.type === "conversation" && typeof message.id === "string")
    return [{ kind: "conversation", id: message.id }];
  if (message.type === "finished") return [{ kind: "finished" }];
  if (message.type === "failure")
    return [{ kind: "failure", message: String(message.message) }];
  const event = asRecord(message.event);
  if (event.type === "turn.ended" && event.reason === "failed") {
    const error = asRecord(event.error);
    const text =
      typeof error.message === "string" ? error.message : "Kimi turn failed";
    return [
      ...(kimiQuotaPatterns.some((pattern) => pattern.test(text))
        ? [{ kind: "quota" as const, message: text }]
        : []),
      { kind: "failure", message: text },
    ];
  }
  if (event.type === "assistant.delta" && typeof event.delta === "string")
    return [{ kind: "text", text: event.delta }];
  if (event.type === "thinking.delta" && typeof event.delta === "string")
    return [{ kind: "reasoning", text: event.delta }];
  if (event.type === "tool.call.started" && typeof event.name === "string")
    return [
      {
        kind: "tool",
        name: event.name,
        input: event.args,
        ...(typeof event.toolCallId === "string"
          ? { callId: event.toolCallId }
          : {}),
      },
    ];
  if (event.type === "tool.result")
    return toolResult(
      event.toolCallId,
      undefined,
      event.output,
      event.isError === true,
    );
  if (event.type === "error")
    return [
      {
        kind: "warning",
        message: String(event.message ?? "Kimi server error"),
      },
    ];
  return [];
}
