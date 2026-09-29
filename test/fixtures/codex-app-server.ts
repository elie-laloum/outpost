import { createInterface } from "node:readline";
import { setTimeout as sleep } from "node:timers/promises";

// Mirrors `codex app-server` messages observed with Codex 0.155: JSON-RPC lines without
// a jsonrpc field, turn/steer only for the active turn, exit after stdin ends.
interface Message {
  readonly id?: string | number;
  readonly method?: string;
  readonly params?: Record<string, unknown>;
}

const thread = "thread-1";
let active: string | undefined;
let turns = 0;
let running: Promise<void> = Promise.resolve();
const injected: string[] = [];

const out = (value: object) =>
  process.stdout.write(`${JSON.stringify(value)}\n`);
const text = (params: Record<string, unknown> | undefined) =>
  ((params?.input as { text: string }[] | undefined) ?? [])
    .map((part) => part.text)
    .join("");

async function turn(id: string, prompt: string, threadId: string) {
  active = id;
  out({
    method: "turn/started",
    params: { threadId, turn: { id, status: "inProgress" } },
  });
  out({
    method: "error",
    params: { error: { message: "Reconnecting... 1/5" }, willRetry: true },
  });
  if (prompt.includes("use a tool")) {
    out({
      method: "item/started",
      params: {
        item: { type: "commandExecution", id: "cmd-1", command: "sleep 1" },
      },
    });
    await sleep(400);
    out({
      method: "item/completed",
      params: {
        item: {
          type: "commandExecution",
          id: "cmd-1",
          aggregatedOutput: "",
          exitCode: 0,
        },
      },
    });
  }
  const answer = [
    `handled: ${prompt}`,
    ...injected.splice(0).map((value) => `injected: ${value}`),
  ].join(" | ");
  out({
    method: "item/completed",
    params: {
      item: {
        type: "agentMessage",
        id: `msg-${id}`,
        text: `${answer} <outpost>done</outpost>`,
      },
    },
  });
  out({
    method: "thread/tokenUsage/updated",
    params: {
      threadId,
      turnId: id,
      tokenUsage: {
        total: {
          inputTokens: 99,
          cachedInputTokens: 0,
          cacheWriteInputTokens: 0,
          outputTokens: 9,
        },
        last: {
          inputTokens: 10,
          cachedInputTokens: 4,
          cacheWriteInputTokens: 0,
          outputTokens: 2,
        },
      },
    },
  });
  await sleep(100);
  active = undefined;
  out({
    method: "turn/completed",
    params: { threadId, turn: { id, status: "completed", error: null } },
  });
}

const handlers: Record<string, (message: Message) => void> = {
  initialize: (message) =>
    out({ id: message.id, result: { userAgent: "fixture" } }),
  "thread/start": (message) => {
    out({ id: message.id, result: { thread: { id: thread } } });
    out({ method: "thread/started", params: { thread: { id: thread } } });
  },
  "thread/resume": (message) =>
    out({
      id: message.id,
      result: { thread: { id: String(message.params?.threadId) } },
    }),
  "turn/start": (message) => {
    const id = `turn-${++turns}`;
    out({ id: message.id, result: { turn: { id, status: "inProgress" } } });
    const threadId = String(message.params?.threadId);
    running = running.then(() => turn(id, text(message.params), threadId));
  },
  "turn/steer": (message) => {
    if (!active || message.params?.expectedTurnId !== active) {
      out({
        id: message.id,
        error: { code: -32600, message: "no active turn to steer" },
      });
      return;
    }
    injected.push(text(message.params));
    out({ id: message.id, result: { turnId: active } });
  },
};

createInterface({ input: process.stdin })
  .on("line", (line) => {
    const message = JSON.parse(line) as Message;
    if (message.method) handlers[message.method]?.(message);
  })
  .on("close", () => {
    void running.then(() => process.exit(0));
  });
