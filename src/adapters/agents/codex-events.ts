import { toolResult } from "./tool-result.ts";
import type { AgentEvent } from "../../domain/agent.types.ts";
import { decodeEvent, decodeLine } from "./event-decoder.ts";
import { asRecord, numberOrZero } from "./protocol.ts";
import type { ProtocolRecord } from "./protocol.types.ts";

function conversation(event: ProtocolRecord): AgentEvent[] {
  return typeof event.thread_id === "string"
    ? [{ kind: "conversation", id: event.thread_id }]
    : [];
}

function completedItem(event: ProtocolRecord): AgentEvent[] {
  return decodeEvent(asRecord(event.item), {
    reasoning: (item) =>
      typeof item.text === "string"
        ? [{ kind: "reasoning", text: item.text }]
        : [],
    command_execution: (item) =>
      toolResult(
        item.id,
        "command",
        item.aggregated_output,
        typeof item.exit_code === "number" && item.exit_code !== 0,
      ),
    mcp_tool_call: (item) =>
      toolResult(
        item.id,
        item.tool,
        item.result ?? item.error,
        item.error !== undefined && item.error !== null,
      ),
    file_change: (item) => [
      {
        kind: "file-change",
        changes: item.changes,
        ...(typeof item.id === "string" ? { callId: item.id } : {}),
      },
    ],
    agent_message: (item) =>
      typeof item.text === "string" ? [{ kind: "text", text: item.text }] : [],
  });
}

function startedItem(event: ProtocolRecord): AgentEvent[] {
  return decodeEvent(asRecord(event.item), {
    command_execution: (item) => [
      {
        kind: "tool",
        name: "command",
        input: item.command,
        ...(typeof item.id === "string" ? { callId: item.id } : {}),
      },
    ],
    mcp_tool_call: (item) => [
      {
        kind: "tool",
        name: String(item.tool),
        input: item.arguments,
        ...(typeof item.id === "string" ? { callId: item.id } : {}),
      },
    ],
  });
}

function completedTurn(event: ProtocolRecord): AgentEvent[] {
  const usage = asRecord(event.usage);
  return [
    {
      kind: "usage",
      tokens: {
        input: numberOrZero(usage.input_tokens),
        cached: numberOrZero(usage.cached_input_tokens),
        ...(typeof usage.cache_creation_input_tokens === "number"
          ? { cacheCreated: numberOrZero(usage.cache_creation_input_tokens) }
          : {}),
        output: numberOrZero(usage.output_tokens),
      },
    },
    { kind: "finished" },
  ];
}

function failure(event: ProtocolRecord): AgentEvent[] {
  const error =
    typeof event.error === "string"
      ? event.error
      : asRecord(event.error).message;
  return [
    {
      kind: "failure",
      message: String(event.message ?? error ?? "Agent failed"),
    },
  ];
}

export function codexEvents(line: string): AgentEvent[] {
  return decodeLine(line, {
    "thread.started": conversation,
    "item.completed": completedItem,
    "item.started": startedItem,
    "turn.completed": completedTurn,
    error: failure,
    "turn.failed": failure,
  });
}
