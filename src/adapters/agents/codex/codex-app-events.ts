import type { AgentEvent } from "../../../domain/agent.types.ts";
import { codexAppRequests } from "./codex-app.constants.ts";
import { decodeEvent } from "../event-decoder.ts";
import { asRecord, numberOrZero } from "../protocol.ts";
import type { EventDecoders, ProtocolRecord } from "../protocol.types.ts";
import { toolResult } from "../tool-result.ts";

const quotaErrors = new Set(["usageLimitExceeded", "rateLimitExceeded"]);

const started: EventDecoders = {
  commandExecution: (item) => [
    {
      kind: "tool",
      name: "command",
      input: item.command,
      ...(typeof item.id === "string" ? { callId: item.id } : {}),
    },
  ],
  mcpToolCall: (item) => [
    {
      kind: "tool",
      name: String(item.tool),
      input: item.arguments,
      ...(typeof item.id === "string" ? { callId: item.id } : {}),
    },
  ],
};

const completed: EventDecoders = {
  agentMessage: (item) =>
    typeof item.text === "string" ? [{ kind: "text", text: item.text }] : [],
  reasoning: (item) => {
    const summary = Array.isArray(item.summary) ? item.summary.join("\n") : "";
    return summary ? [{ kind: "reasoning", text: summary }] : [];
  },
  commandExecution: (item) =>
    toolResult(
      item.id,
      "command",
      item.aggregatedOutput,
      typeof item.exitCode === "number" && item.exitCode !== 0,
    ),
  mcpToolCall: (item) =>
    toolResult(
      item.id,
      item.tool,
      item.result ?? item.error,
      item.error !== undefined && item.error !== null,
    ),
  fileChange: (item) => [
    {
      kind: "file-change",
      changes: item.changes,
      ...(typeof item.id === "string" ? { callId: item.id } : {}),
    },
  ],
};

function thread(value: unknown): AgentEvent[] {
  const id = asRecord(value).id;
  return typeof id === "string" ? [{ kind: "conversation", id }] : [];
}

function failure(message: unknown, fallback: string): AgentEvent[] {
  return [
    {
      kind: "failure",
      message: typeof message === "string" && message ? message : fallback,
    },
  ];
}

const notifications: EventDecoders = {
  "thread/started": (params) => thread(params.thread),
  "item/started": (params) => decodeEvent(asRecord(params.item), started),
  "item/completed": (params) => decodeEvent(asRecord(params.item), completed),
  "thread/tokenUsage/updated": (params) => {
    const last = asRecord(asRecord(params.tokenUsage).last);
    return [
      {
        kind: "usage",
        tokens: {
          input: numberOrZero(last.inputTokens),
          cached: numberOrZero(last.cachedInputTokens),
          cacheCreated: numberOrZero(last.cacheWriteInputTokens),
          output: numberOrZero(last.outputTokens),
        },
      },
    ];
  },
  // Retried errors are transient notices; only the final error is a failure.
  error: (params) => {
    if (params.willRetry === true) return [];
    const error = asRecord(params.error);
    const info = error.codexErrorInfo;
    const quota: AgentEvent[] =
      typeof info === "string" && quotaErrors.has(info)
        ? [{ kind: "quota", message: `Codex reported ${info}` }]
        : [];
    return [...quota, ...failure(error.message, "Codex reported an error")];
  },
  "turn/completed": (params) => {
    const turn = asRecord(params.turn);
    if (turn.status === "completed") return [{ kind: "finished" }];
    return failure(
      asRecord(turn.error).message,
      `Codex turn ${String(turn.status ?? "ended")}`,
    );
  },
};

/** Decodes one JSON-RPC message from `codex app-server`. */
export function codexAppEvents(message: ProtocolRecord): AgentEvent[] {
  if (typeof message.method === "string") {
    if (message.id !== undefined) return [];
    const notification = Object.hasOwn(notifications, message.method)
      ? notifications[message.method]
      : undefined;
    return notification?.(asRecord(message.params)) ?? [];
  }
  const id = typeof message.id === "string" ? message.id : "";
  if (message.error !== undefined)
    return id.startsWith(`${codexAppRequests.steer}-`)
      ? []
      : failure(asRecord(message.error).message, "Codex rejected a request");
  return thread(asRecord(message.result).thread);
}
