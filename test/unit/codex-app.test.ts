import { test } from "node:test";
import assert from "node:assert/strict";
import { agent, codexHarness } from "../../src/index.ts";
import {
  codexAppInitialize,
  codexAppSession,
} from "../../src/adapters/agents/codex-app-session.ts";

const parse = (lines: readonly string[]) =>
  lines.map((line) => JSON.parse(line) as Record<string, unknown>);
const response = (id: unknown, result: object) =>
  JSON.stringify({ id, result });

test("Codex app-server sessions open, resume or fork a thread and queue early steering", () => {
  const initialize = parse([codexAppInitialize()])[0]!;
  assert.equal(initialize.method, "initialize");
  const session = codexAppSession(
    { model: { name: "gpt-5.5", reasoning: "high" } },
    { text: "Refactor", continuation: { id: "thread-0", fork: true } },
  );
  assert.equal(session.encode("Early"), "");
  const opened = parse(session.read(response(initialize.id, {})).replies);
  assert.deepEqual(opened[0], { method: "initialized" });
  assert.equal(opened[1]!.method, "thread/fork");
  assert.deepEqual(opened[1]!.params, {
    threadId: "thread-0",
    approvalPolicy: "never",
    sandbox: "danger-full-access",
    model: "gpt-5.5",
  });
  const started = parse(
    session.read(response(opened[1]!.id, { thread: { id: "thread-1" } }))
      .replies,
  );
  assert.equal(started[0]!.method, "turn/start");
  assert.deepEqual(started[0]!.params, {
    threadId: "thread-1",
    input: [{ type: "text", text: "Refactor", text_elements: [] }],
    effort: "high",
  });
  const accepted = session.read(
    response(started[0]!.id, { turn: { id: "turn-1" } }),
  );
  assert.equal(accepted.consumed, 1);
  const steer = parse(accepted.replies)[0]!;
  assert.equal(steer.method, "turn/steer");
  assert.deepEqual(steer.params, {
    threadId: "thread-1",
    expectedTurnId: "turn-1",
    input: [{ type: "text", text: "Early", text_elements: [] }],
  });
  assert.deepEqual(session.read(response(steer.id, { turnId: "turn-1" })), {
    consumed: 1,
    replies: [],
  });
});

test("Codex app-server sessions restart rejected steering as a new turn and refuse server requests", () => {
  const session = codexAppSession(
    { approvalReviewer: "auto_review" },
    { text: "Work" },
  );
  const opened = parse(
    session.read(response("outpost-initialize-0", {})).replies,
  );
  assert.deepEqual(opened[1]!.params, {
    approvalPolicy: "on-request",
    sandbox: "danger-full-access",
    approvalsReviewer: "auto_review",
  });
  const started = parse(
    session.read(response(opened[1]!.id, { thread: { id: "thread-1" } }))
      .replies,
  );
  session.read(response(started[0]!.id, { turn: { id: "turn-1" } }));
  session.read(
    JSON.stringify({
      method: "turn/started",
      params: { turn: { id: "turn-1" } },
    }),
  );
  const steer = parse([session.encode("Late")])[0]!;
  assert.equal(steer.method, "turn/steer");
  session.read(JSON.stringify({ method: "turn/completed", params: {} }));
  const rejected = session.read(
    JSON.stringify({ id: steer.id, error: { message: "no active turn" } }),
  );
  assert.equal(rejected.consumed, 0);
  const restarted = parse(rejected.replies)[0]!;
  assert.equal(restarted.method, "turn/start");
  assert.equal(
    (restarted.params as { input: { text: string }[] }).input[0]!.text,
    "Late",
  );
  assert.equal(parse([session.encode("After")])[0]!.method, "turn/start");
  const refused = parse(
    session.read(
      JSON.stringify({
        id: 7,
        method: "item/commandExecution/requestApproval",
      }),
    ).replies,
  )[0]!;
  assert.equal(refused.id, 7);
  assert.equal((refused.error as { code: number }).code, -32601);
  assert.deepEqual(
    session.read(
      JSON.stringify({ id: "x", method: "item/tool/requestUserInput" }),
    ).replies.length,
    1,
  );
  assert.deepEqual(session.read("not json"), { consumed: 0, replies: [] });
  assert.deepEqual(
    session.read(JSON.stringify({ id: "unknown-1", result: {} })),
    {
      consumed: 0,
      replies: [],
    },
  );
});

test("Codex decodes app-server notifications and keeps exec events", () => {
  const codex = agent({ harness: codexHarness() });
  assert.ok(codex.kind === "cli" && codex.liveInput);
  assert.deepEqual(codex.request({ text: "Work", liveInput: true }), {
    executable: "codex",
    arguments: ["app-server"],
    stdin: codexAppInitialize(),
  });
  const events = (message: object) => codex.events(JSON.stringify(message));
  assert.deepEqual(
    events({ id: "outpost-thread-1", result: { thread: { id: "t" } } }),
    [{ kind: "conversation", id: "t" }],
  );
  assert.deepEqual(events({ method: "error", params: { willRetry: true } }), [
    { kind: "raw", value: { method: "error", params: { willRetry: true } } },
  ]);
  assert.deepEqual(
    events({
      method: "error",
      params: {
        willRetry: false,
        error: { message: "limit", codexErrorInfo: "usageLimitExceeded" },
      },
    }),
    [
      { kind: "quota", message: "Codex reported usageLimitExceeded" },
      { kind: "failure", message: "limit" },
    ],
  );
  assert.deepEqual(
    events({
      method: "turn/completed",
      params: { turn: { status: "failed", error: { message: "401" } } },
    }),
    [{ kind: "failure", message: "401" }],
  );
  assert.deepEqual(
    events({
      method: "turn/completed",
      params: { turn: { status: "interrupted" } },
    }),
    [{ kind: "failure", message: "Codex turn interrupted" }],
  );
  assert.deepEqual(
    events({ id: "outpost-steer-2", error: { message: "no active turn" } }),
    [
      {
        kind: "raw",
        value: { id: "outpost-steer-2", error: { message: "no active turn" } },
      },
    ],
  );
  assert.deepEqual(
    events({ id: "outpost-turn-2", error: { message: "bad input" } }),
    [{ kind: "failure", message: "bad input" }],
  );
  assert.deepEqual(
    events({
      method: "item/started",
      params: {
        item: { type: "mcpToolCall", id: "m", tool: "read", arguments: {} },
      },
    }),
    [{ kind: "tool", name: "read", input: {}, callId: "m" }],
  );
  assert.deepEqual(
    events({
      method: "item/completed",
      params: { item: { type: "reasoning", summary: ["plan", "act"] } },
    }),
    [{ kind: "reasoning", text: "plan\nact" }],
  );
  assert.deepEqual(
    events({
      method: "item/completed",
      params: { item: { type: "fileChange", id: "f", changes: [] } },
    }),
    [{ kind: "file-change", changes: [], callId: "f" }],
  );
  assert.equal(
    events({
      method: "item/completed",
      params: {
        item: {
          type: "mcpToolCall",
          id: "m",
          tool: "read",
          error: { message: "x" },
        },
      },
    })[0]!.kind,
    "tool-result",
  );
  assert.deepEqual(events({ method: "thread/status/changed", params: {} }), [
    { kind: "raw", value: { method: "thread/status/changed", params: {} } },
  ]);
  assert.deepEqual(events({ type: "thread.started", thread_id: "exec" }), [
    { kind: "conversation", id: "exec" },
  ]);
});
