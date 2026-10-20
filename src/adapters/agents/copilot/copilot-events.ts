import { copilotShutdown, copilotUsage } from "./copilot-usage.ts";
import { toolResult } from "../tool-result.ts";
import type { AgentEvent } from "../../../domain/agent.types.ts";
import { decodeLine } from "../event-decoder.ts";
import { asRecord, decodeRecord } from "../protocol.ts";
import { copilotRpcInitialId } from "./copilot-rpc.constants.ts";
import type { ProtocolRecord } from "../protocol.types.ts";
import { copilotQuotaErrors } from "./copilot.constants.ts";

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
  const rpc = decodeRecord(line);
  if (rpc?.jsonrpc === "2.0") {
    if (rpc.error !== undefined)
      return [
        {
          kind: "failure",
          message:
            typeof asRecord(rpc.error).message === "string"
              ? String(asRecord(rpc.error).message)
              : "Copilot rejected an RPC request",
        },
      ];
    if (rpc.id === copilotRpcInitialId) {
      const id = asRecord(rpc.result).sessionId;
      return typeof id === "string"
        ? [{ kind: "conversation", id }]
        : [{ kind: "failure", message: "Copilot omitted the session ID" }];
    }
    if (rpc.method !== "session.event") return [];
    const event = asRecord(asRecord(rpc.params).event);
    if (event.type === "session.idle") return [{ kind: "finished" }];
    if (event.type === "session.error")
      return [
        ...copilotEvents(JSON.stringify(event)),
        {
          kind: "failure",
          message: String(
            asRecord(event.data).message ?? "Copilot session failed",
          ),
        },
      ];
    return copilotEvents(JSON.stringify(event));
  }
  return decodeLine(line, {
    "assistant.message": message,
    "assistant.usage": (event) => [
      { kind: "usage", tokens: copilotUsage(event.data) },
    ],
    "session.shutdown": copilotShutdown,
    "assistant.reasoning": (event) => {
      const data = asRecord(event.data);
      return typeof data.content === "string"
        ? [{ kind: "reasoning", text: data.content }]
        : [];
    },
    "tool.execution_complete": (event) => {
      const data = asRecord(event.data);
      return toolResult(
        data.toolCallId,
        undefined,
        data.result ?? data.error,
        data.success === false,
      );
    },
    "session.error": (event) => {
      const data = asRecord(event.data);
      if (typeof data.message !== "string") return [];
      return typeof data.errorType === "string" &&
        copilotQuotaErrors.has(data.errorType)
        ? [{ kind: "quota", message: data.message }]
        : [{ kind: "warning", message: data.message }];
    },
    result,
  });
}
