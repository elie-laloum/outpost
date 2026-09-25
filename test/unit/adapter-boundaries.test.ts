import { agent as composeAgent } from "../../src/domain/agent.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  claudeHarness,
  codexHarness,
  geminiHarness,
} from "../../src/providers/agents.ts";
import { agentOutput } from "../../src/application/agent-output.ts";
import { operationGate } from "../../src/application/operation-gate.ts";
import { addUsage } from "../../src/domain/usage.ts";

for (const adapter of [
  composeAgent({ harness: claudeHarness({}) }),
  composeAgent({ harness: codexHarness({}) }),
  composeAgent({ harness: geminiHarness({}) }),
]) {
  test(`${adapter.name} preserves unknown protocol events without invoking inherited handlers`, () => {
    for (const type of [
      "future.event",
      "constructor",
      "toString",
      "__proto__",
    ]) {
      const event = { type, payload: "unrecognized" };
      assert.deepEqual(adapter.events(JSON.stringify(event)), [
        { kind: "raw", value: event },
      ]);
    }
    for (const line of ["not json", "", "{"])
      assert.deepEqual(adapter.events(line), [{ kind: "raw", value: line }]);
  });
}

test("agent output handles split lines and an authoritative final result", () => {
  const observed: string[] = [];
  const output = agentOutput(
    composeAgent({ harness: claudeHarness({}) }),
    { brief: { text: "go" }, observe: (event) => observed.push(event.kind) },
    ["done"],
    1,
  );
  const text = JSON.stringify({
    type: "assistant",
    message: { content: [{ type: "text", text: "partial" }] },
  });
  output.append(text.slice(0, 20));
  assert.equal(output.result().text, text.slice(0, 20));
  output.append(text.slice(20) + "\n");
  const result = JSON.stringify({
    type: "result",
    result: "done",
    usage: { input_tokens: 3, cache_read_input_tokens: 2, output_tokens: 1 },
  });
  output.append(result);
  assert.equal(output.completed, false);
  output.flush();
  output.flush();
  assert.equal(output.completed, true);
  assert.deepEqual(output.result(), {
    text: "done",
    usage: { input: 3, cached: 2, cacheCreated: 0, output: 1 },
  });
  assert.deepEqual(observed, [
    "raw",
    "text",
    "raw",
    "result",
    "usage",
    "finished",
  ]);
});

test("operation ownership recovers from failure and waits for active work on close", async () => {
  const gate = operationGate();
  const failure = new Error("failed operation");
  await assert.rejects(
    gate.run(async () => {
      throw failure;
    }),
    (error) => error === failure,
  );
  let complete!: (value: number) => void;
  const pending = new Promise<number>((resolve) => {
    complete = resolve;
  });
  const active = gate.run(() => pending);
  assert.throws(() => gate.run(async () => 2), /active operation/);
  let closed = false;
  const closing = gate.close().then(() => {
    closed = true;
  });
  assert.throws(() => gate.run(async () => 3), /closed/);
  await Promise.resolve();
  assert.equal(closed, false);
  complete(42);
  assert.equal(await active, 42);
  await closing;
  assert.equal(closed, true);
});

test("usage aggregation preserves optional cache accounting without mutating inputs", () => {
  const first = Object.freeze({ input: 2, cached: 1, output: 3 });
  assert.deepEqual(addUsage(first, first), { input: 4, cached: 2, output: 6 });
  assert.deepEqual(addUsage(first, { ...first, cacheCreated: 0 }), {
    input: 4,
    cached: 2,
    output: 6,
    cacheCreated: 0,
  });
  assert.deepEqual(addUsage({ ...first, cacheCreated: 4 }, first), {
    input: 4,
    cached: 2,
    output: 6,
    cacheCreated: 4,
  });
});
