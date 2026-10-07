import { test } from "node:test";
import assert from "node:assert/strict";
import { repetitionWatchdog } from "../../src/application/repetition-watchdog.ts";
import { createReplayAgent, createSteering } from "../../src/index.ts";
import { scripted } from "../helpers.ts";
import {
  preflightDispatch,
  validateDispatch,
} from "../../src/application/dispatch-validation.ts";
import { OutpostError } from "../../src/domain/errors.ts";
import type { AgentObservation } from "../../src/domain/agent.types.ts";
import type { WatchdogOptions } from "../../src/index.ts";

const tool = (
  input: unknown,
  callId?: string,
): Extract<AgentObservation, { kind: "tool" }> => ({
  kind: "tool",
  name: "shell",
  input,
  pass: 1,
  at: "now",
  ...(callId ? { callId } : {}),
});

function monitor(onStuck: WatchdogOptions["onStuck"] = "stop", window = 4) {
  const controller = new AbortController();
  const events: AgentObservation[] = [];
  const watchdog = repetitionWatchdog({
    brief: { text: "work" },
    watchdog: { repetition: { window, maxRepeats: 3 }, onStuck },
    observe: (event) => events.push(event),
  });
  return {
    controller,
    events,
    watchdog,
    send: (event: AgentObservation) => watchdog.observe(event, controller),
  };
}

test("repetition counts canonical inputs and ignores call ids and protocol duplicates", () => {
  const { send, controller, events } = monitor();
  send(tool({ command: "ls", cwd: "." }, "one"));
  send(tool({ cwd: ".", command: "ls" }, "one"));
  send(tool({ cwd: ".", command: "ls" }, "two"));
  assert.equal(controller.signal.aborted, false);
  send(tool({ command: "ls", cwd: "." }, "three"));
  assert.equal(controller.signal.reason.code, "stuck");
  assert.equal(events[0]?.kind, "stuck");
  send(tool({ command: "ls", cwd: "." }));
  assert.equal(events.length, 1);
});

test("sliding window drops old calls, separates tools and ignores unrelated activity", () => {
  const { send, controller } = monitor();
  send(tool("ls"));
  send({ kind: "text", text: "working", at: "now", pass: 1 });
  send(tool("ls"));
  send({ ...tool("ls"), name: "read" });
  send(tool("pwd"));
  send(tool("status"));
  send(tool("ls"));
  assert.equal(controller.signal.aborted, false);
  send(tool("ls"));
  send(tool("ls"));
  assert.equal(controller.signal.reason.code, "stuck");
});

test("file changes, scopes and passes have distinct repetition identities", () => {
  const { send, controller, events } = monitor();
  send({ ...tool("ls"), subagentId: "a" });
  send({ ...tool("ls"), subagentId: "b" });
  send({ ...tool("ls"), subagentId: "c" });
  send({ ...tool("ls"), pass: 2 });
  assert.equal(controller.signal.aborted, false);
  const change: AgentObservation = {
    kind: "file-change",
    changes: [{ path: "a", kind: "update" }],
    pass: 2,
    at: "now",
  };
  for (let index = 0; index < 3; index++)
    send({ ...change, callId: String(index) });
  assert.equal(
    events[0]?.kind === "stuck" && events[0].activity,
    "file-change",
  );
});

test("warn emits one event per episode and stays active", () => {
  const { send, controller, events } = monitor("warn");
  for (let index = 0; index < 7; index++) send(tool("ls"));
  assert.equal(controller.signal.aborted, false);
  assert.equal(events.filter((event) => event.kind === "stuck").length, 2);
  assert.equal(events.filter((event) => event.kind === "warning").length, 2);
});

test("non-JSON inputs advance the window without false matches or executing accessors", () => {
  const { send, controller } = monitor();
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  for (const input of [
    cycle,
    BigInt(1),
    {
      get secret() {
        throw new Error("must not run");
      },
    },
  ])
    for (let index = 0; index < 3; index++) send(tool(input));
  assert.equal(controller.signal.aborted, false);
  send(tool(undefined));
  send(tool(null));
  send(tool(undefined));
  assert.equal(controller.signal.aborted, false);
  send(tool(undefined));
  assert.equal(controller.signal.reason.code, "stuck");
});

test("watchdog settings fail before execution", () => {
  for (const repetition of [
    { window: 0, maxRepeats: 3 },
    { window: 20, maxRepeats: 1 },
    { window: 2, maxRepeats: 3 },
    { window: 20.5, maxRepeats: 3 },
    { window: 10_001, maxRepeats: 3 },
  ])
    assert.throws(
      () =>
        validateDispatch({
          brief: { text: "work" },
          watchdog: { repetition, onStuck: "stop" },
        }),
      OutpostError,
    );
  for (const onStuck of [
    { instruction: " " },
    { instruction: "change", maxInterventions: 0 },
  ])
    assert.throws(
      () =>
        validateDispatch({
          brief: { text: "work" },
          watchdog: { repetition: { window: 20, maxRepeats: 3 }, onStuck },
        }),
      OutpostError,
    );
});

test("watchdog delivery failure aborts the active turn and remains a steering fault", async () => {
  const steering = createSteering();
  const controller = new AbortController();
  const watchdog = repetitionWatchdog({
    brief: { text: "work" },
    steering,
    watchdog: {
      repetition: { window: 3, maxRepeats: 3 },
      onStuck: { instruction: "Change approach" },
    },
  });
  for (let index = 0; index < 3; index++)
    watchdog.observe(tool("ls"), controller);
  assert.throws(
    () => watchdog.finish(),
    (error: unknown) =>
      error instanceof OutpostError && error.code === "steering",
  );
  steering.close();
  await Promise.resolve();
  assert.equal(controller.signal.reason.code, "steering");
  assert.throws(() => watchdog.finish(), /could not be delivered/);
});

test("preflight refuses watchdogs on replay agents and instructions on unsteerable CLIs", async () => {
  const replay = createReplayAgent({
    journal: [
      { kind: "prompt", text: "work", pass: 1, source: "agent" },
      {
        kind: "stuck",
        activity: "tool",
        repeats: 3,
        window: 20,
        action: "stop",
        pass: 1,
      },
      {
        kind: "dispatch-finished",
        status: "failed",
        error: { code: "stuck", message: "repeated" },
        pass: 1,
      },
    ],
  });
  assert.equal(replay.turns[0]?.failure?.code, "stuck");
  await assert.rejects(
    preflightDispatch(
      {
        brief: { text: "work" },
        watchdog: {
          repetition: { window: 20, maxRepeats: 3 },
          onStuck: "stop",
        },
      },
      ".",
      replay,
    ),
    /Replay agents/,
  );
  await assert.rejects(
    preflightDispatch(
      {
        brief: { text: "work" },
        watchdog: {
          repetition: { window: 20, maxRepeats: 3 },
          onStuck: { instruction: "change" },
        },
      },
      ".",
      { ...scripted(""), resumable: false },
    ),
    /cannot be steered/,
  );
});
