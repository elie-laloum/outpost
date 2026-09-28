import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  localTransport,
  loopTask,
  LoopTaskExhausted,
  workflow,
  workflowCheckpointStore,
} from "../../src/index.ts";
import type {
  LoopTaskContext,
  WorkflowCheckpoint,
  WorkflowCheckpointStore,
} from "../../src/index.ts";

for (const interrupted of ["attempt", "check"]) {
  test(`durable resume of interrupted ${interrupted} preserves rounds and usage`, async (t) => {
    const directory = await mkdtemp(join(tmpdir(), "outpost-loop-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const checkpoint = {
      store: workflowCheckpointStore({
        transporter: localTransport({ directory }),
      }),
      runId: "fix",
      version: "1",
    };
    let interrupt = true;
    const attempts: number[] = [],
      checks: number[] = [],
      keys: string[] = [];
    const definitions = () => {
      const fix = loopTask({
        key: "fix",
        maxRounds: 3,
        attempt(ctx, feedback) {
          attempts.push(ctx.round);
          assert.equal(feedback, ctx.round === 1 ? undefined : "feedback");
          if (ctx.phase === interrupted) keys.push(ctx.idempotencyKey);
          ctx.reportUsage({ input: 1, cached: 0, output: 1 });
          if (interrupt && ctx.round === 2 && interrupted === "attempt")
            throw new Error("interrupted");
          return { round: ctx.round };
        },
        check(ctx, value) {
          checks.push(ctx.round);
          assert.equal(value.round, ctx.round);
          if (ctx.phase === interrupted) keys.push(ctx.idempotencyKey);
          ctx.reportUsage({ input: 1, cached: 0, output: 1 });
          if (interrupt && ctx.round === 2 && interrupted === "check")
            throw new Error("interrupted");
          return ctx.round === 3
            ? { done: true }
            : { done: false, feedback: "feedback" };
        },
      });
      return { fix, graph: workflow("fix", [fix]) };
    };
    const first = await definitions().graph.start({ checkpoint });
    assert.equal(first.status, "failed");
    await assert.rejects(
      definitions().graph.start({ checkpoint }),
      /explicitly authorize replay/,
    );
    interrupt = false;
    const resumed = definitions();
    const result = await resumed.graph.start({
      checkpoint: { ...checkpoint, resume: "retry-incomplete" },
      budget: { attempts: 4 },
    });
    result.unwrap();
    assert.deepEqual(result.value(resumed.fix), { round: 3 });
    assert.deepEqual(
      attempts,
      interrupted === "attempt" ? [1, 2, 2, 3] : [1, 2, 3],
    );
    assert.deepEqual(
      checks,
      interrupted === "check" ? [1, 2, 2, 3] : [1, 2, 3],
    );
    assert.equal(keys[1], keys[2]);
    assert.equal(result.usage.attempts, 4);
    assert.equal(result.usage.tokens.input, 7);
    const final = definitions();
    const restored = await final.graph.start({ checkpoint });
    restored.unwrap();
    assert.deepEqual(restored.value(final.fix), { round: 3 });
    assert.deepEqual(restored.usage, result.usage);
  });
}

function memory() {
  let saved: WorkflowCheckpoint | undefined;
  const store: WorkflowCheckpointStore = {
    async acquire() {
      return {
        async read() {
          return saved === undefined ? undefined : structuredClone(saved);
        },
        async write(value) {
          saved = structuredClone(value);
        },
        async release() {},
      };
    },
  };
  return {
    store,
    read: () => saved!,
    replace(value: WorkflowCheckpoint) {
      saved = value;
    },
  };
}

test("maxRounds remains exhausted after resume and participates in identity", async () => {
  const storage = memory();
  const checkpoint = {
    store: storage.store,
    runId: "fix",
    version: "1",
    resume: "retry-incomplete" as const,
  };
  let calls = 0;
  const build = (maxRounds: number) =>
    workflow("fix", [
      loopTask({
        key: "fix",
        maxRounds,
        attempt() {
          calls++;
          return 1;
        },
        check: () => ({ done: false, feedback: "no" }),
      }),
    ]);
  await build(2).start({ checkpoint });
  const resumed = await build(2).start({ checkpoint });
  assert.ok(resumed.errors[0] instanceof LoopTaskExhausted);
  assert.equal(calls, 2);
  assert.equal(resumed.usage.attempts, 2);
  await assert.rejects(build(3).start({ checkpoint }), /incompatible/);
});

test("saved verification resumes under cumulative budget and rejects non-JSON output", async () => {
  const storage = memory();
  const checkpoint = {
    store: storage.store,
    runId: "fix",
    version: "1",
    resume: "retry-incomplete" as const,
  };
  let attempts = 0,
    checks = 0;
  const fix = loopTask({
    key: "fix",
    maxRounds: 1,
    attempt() {
      attempts++;
    },
    check() {
      checks++;
      throw new Error("review offline");
    },
  });
  const graph = workflow("fix", [fix]);
  await graph.start({ checkpoint });
  const result = await graph.start({ checkpoint, budget: { attempts: 1 } });
  assert.equal(result.status, "failed");
  assert.equal(attempts, 1);
  assert.equal(checks, 1);
  const date = loopTask({
    key: "date",
    maxRounds: 1,
    attempt: () => new Date(),
    check: () => assert.fail("must reject before review"),
  });
  const invalid = await workflow("date", [date]).start({
    checkpoint: { ...checkpoint, store: memory().store },
  });
  assert.match(String(invalid.errors[0]), /plain JSON/);
});

test("malformed loop checkpoints fail before callbacks", async () => {
  const storage = memory();
  const checkpoint = {
    store: storage.store,
    runId: "fix",
    version: "1",
    resume: "retry-incomplete" as const,
  };
  const fix = loopTask({
    key: "fix",
    maxRounds: 1,
    attempt: () => 1,
    check: () => ({ done: true }),
  });
  await workflow("fix", [fix]).start({ checkpoint });
  const valid = storage.read();
  for (const rounds of [
    [],
    [{ round: 2, phase: "complete" }],
    [{ round: 1, phase: "check" }],
    [
      {
        round: 1,
        phase: "complete",
        output: { kind: "json", value: 1 },
        check: { done: false },
      },
    ],
  ]) {
    const corrupt = structuredClone(valid);
    Object.assign(corrupt.records[0]!, { rounds });
    storage.replace(corrupt);
    await assert.rejects(
      workflow("fix", [fix]).start({ checkpoint }),
      /loop checkpoint|Loop check/,
    );
  }
});

test("an accepted persisted round finishes after a crash without another callback", async () => {
  const storage = memory();
  const checkpoint = { store: storage.store, runId: "fix", version: "1" };
  let calls = 0;
  const fix = loopTask({
    key: "fix",
    maxRounds: 1,
    attempt() {
      calls++;
      return { accepted: true };
    },
    check: () => ({ done: true }),
  });
  const graph = workflow("fix", [fix]);
  await graph.start({ checkpoint });
  const saved = structuredClone(storage.read());
  Object.assign(saved.records[0]!, { status: "active" });
  delete (saved.values as Record<string, unknown>).fix;
  storage.replace(saved);
  const result = await graph.start({
    checkpoint: { ...checkpoint, resume: "retry-incomplete" },
  });
  result.unwrap();
  assert.equal(calls, 1);
  assert.equal(result.usage.attempts, 1);
  assert.deepEqual(result.value(fix), { accepted: true });
});

test("review mutation cannot change the saved candidate before its checkpoint", async () => {
  const storage = memory();
  const checkpoint = {
    store: storage.store,
    runId: "fix",
    version: "1",
    resume: "retry-incomplete" as const,
  };
  let calls = 0;
  const fix = loopTask({
    key: "fix",
    maxRounds: 1,
    attempt: () => ({ count: 0 }),
    check(_, value) {
      calls++;
      assert.equal(value.count, 0);
      value.count++;
      if (calls < 3) throw new Error("interrupted review");
      return { done: true };
    },
  });
  const graph = workflow("fix", [fix]);
  await graph.start({ checkpoint });
  await graph.start({ checkpoint });
  const result = await graph.start({ checkpoint });
  result.unwrap();
  assert.deepEqual(result.value(fix), { count: 1 });
  assert.deepEqual((await graph.start({ checkpoint })).value(fix), {
    count: 1,
  });
});
