import assert from "node:assert/strict";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import {
  defineWorkflow,
  defineTask,
  WorkflowFailure,
} from "../../src/index.ts";
import type { Task } from "../../src/index.ts";

test("typed values flow through a diamond regardless of declaration order", async () => {
  const seed = defineTask({ key: "seed", perform: () => 3 });
  const left = defineTask({
    key: "left",
    after: [seed],
    perform: (ctx) => ctx.value(seed) * 2,
  });
  const right = defineTask({
    key: "right",
    after: [seed],
    perform: (ctx) => ctx.value(seed) + 1,
  });
  const join = defineTask({
    key: "join",
    after: [left, right],
    perform: (ctx) => ctx.value(left) + ctx.value(right),
  });
  const result = await defineWorkflow("diamond", [
    join,
    right,
    left,
    seed,
  ]).start({
    concurrency: 2,
  });
  result.unwrap();
  assert.equal(result.value(join), 10);
  assert.ok(result.tasks.every((item) => item.status === "done"));
});

test("concurrency is bounded and independent work actually overlaps", async () => {
  let active = 0,
    peak = 0;
  const tasks = Array.from({ length: 5 }, (_, i) =>
    defineTask({
      key: `t${i}`,
      async perform() {
        active++;
        peak = Math.max(peak, active);
        await delay(20);
        active--;
        return i;
      },
    }),
  );
  const result = await defineWorkflow("parallel", tasks).start({
    concurrency: 2,
  });
  result.unwrap();
  assert.equal(peak, 2);
  assert.equal(active, 0);
});

test("a dependent starts after the last remaining asynchronous task settles", async () => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const fast = defineTask({
    key: "fast",
    perform() {
      setImmediate(release);
      return 1;
    },
  });
  const slow = defineTask({
    key: "slow",
    async perform() {
      await pending;
      return 2;
    },
  });
  const dependent = defineTask({
    key: "dependent",
    after: [slow],
    perform: (context) => context.value(slow) + 1,
  });
  const result = await defineWorkflow("asynchronous-dependency", [
    fast,
    slow,
    dependent,
  ]).start({ concurrency: 2 });
  result.unwrap();
  assert.equal(result.value(dependent), 3);
  assert.ok(result.tasks.every((entry) => entry.status === "done"));
});

test("errors skip dependents while independent branches finish", async () => {
  const bad = defineTask({
    key: "bad",
    perform() {
      throw new Error("expected");
    },
  });
  const child = defineTask({
    key: "child",
    after: [bad],
    perform: () => assert.fail("must not run"),
  });
  const other = defineTask({ key: "other", perform: () => 42 });
  const result = await defineWorkflow("continue", [bad, child, other]).start({
    stopOnError: false,
  });
  assert.equal(result.status, "failed");
  assert.equal(result.value(other), 42);
  assert.equal(result.tasks[1]?.status, "skipped");
  assert.throws(() => result.unwrap(), WorkflowFailure);
});

test("fail fast cancels siblings and awaits their cleanup", async () => {
  let cleaned = false;
  const slow = defineTask({
    key: "slow",
    async perform(ctx) {
      try {
        await delay(10000, undefined, { signal: ctx.signal });
      } finally {
        await delay(10);
        cleaned = true;
      }
    },
  });
  const bad = defineTask({
    key: "bad",
    async perform() {
      await delay(10);
      throw new Error("broken");
    },
  });
  const result = await defineWorkflow("stop", [slow, bad]).start({
    concurrency: 2,
  });
  assert.equal(result.status, "failed");
  assert.equal(cleaned, true);
  assert.equal(result.tasks[0]?.status, "cancelled");
});

test("external cancellation also works before the first task", async () => {
  const result = await defineWorkflow("cancel", [
    defineTask({ key: "never", perform: () => assert.fail() }),
  ]).start({ signal: AbortSignal.abort("stop") });
  assert.equal(result.status, "cancelled");
  assert.equal(result.tasks[0]?.attempts, 0);
});

test("retry policy receives attempts and retains only the successful value", async () => {
  const item = defineTask({
    key: "retry",
    retry: { attempts: 3, accepts: (error) => error instanceof Error },
    perform(ctx) {
      if (ctx.attempt < 3) throw new Error("temporary");
      return ctx.attempt;
    },
  });
  const result = await defineWorkflow("retry", [item]).start();
  assert.equal(result.value(item), 3);
  assert.equal(result.tasks[0]?.attempts, 3);
});

test("retry predicates can stop retries", async () => {
  const item = defineTask({
    key: "fail",
    retry: { attempts: 4, accepts: () => false },
    perform() {
      throw new Error("permanent");
    },
  });
  const result = await defineWorkflow("retry", [item]).start();
  assert.equal(result.tasks[0]?.attempts, 1);
});

test("cooperative timeouts fail a task and do not publish a late value", async () => {
  const item = defineTask({
    key: "timeout",
    timeoutMs: 10,
    async perform(ctx) {
      await delay(10000, undefined, { signal: ctx.signal });
      return 1;
    },
  });
  const result = await defineWorkflow("timeout", [item]).start();
  assert.equal(result.status, "failed");
  assert.throws(() => result.value(item));
});

test("false conditions skip their descendants", async () => {
  const skip = defineTask({
    key: "skip",
    condition: () => false,
    perform: () => assert.fail(),
  });
  const after = defineTask({
    key: "after",
    after: [skip],
    perform: () => assert.fail(),
  });
  const result = await defineWorkflow("conditional", [after, skip]).start();
  assert.equal(result.status, "done");
  assert.ok(result.tasks.every((item) => item.status === "skipped"));
});

test("graphs reject missing dependencies, duplicate names and cycles", () => {
  const a = defineTask({ key: "a", perform: () => 0 });
  assert.throws(() => defineWorkflow("invalid", [a, a]), /Duplicate/);
  assert.throws(
    () =>
      defineWorkflow("invalid", [
        defineTask({ key: "b", after: [a], perform: () => 0 }),
      ]),
    /missing/,
  );
  const cyclic: Task = { key: "cycle", after: [], perform: () => 0 };
  (cyclic.after as Task[]).push(cyclic);
  assert.throws(() => defineWorkflow("invalid", [cyclic]), /cycle/);
});

test("undeclared value access is an actionable failure", async () => {
  const a = defineTask({ key: "a", perform: () => 1 });
  const b = defineTask({ key: "b", perform: (ctx) => ctx.value(a) });
  const result = await defineWorkflow("invalid", [a, b]).start();
  assert.match(result.tasks[1]?.error ?? "", /undeclared/);
});

test("observers cannot change execution outcome and values are per execution", async () => {
  let count = 0;
  const item = defineTask({ key: "counter", perform: () => ++count });
  const graph = defineWorkflow("repeat", [item]);
  const first = await graph.start({
    observe() {
      throw new Error("observer");
    },
  });
  const second = await graph.start();
  assert.equal(first.status, "done");
  assert.ok(first.observerErrors.length > 0);
  assert.equal(first.value(item), 1);
  assert.equal(second.value(item), 2);
  assert.notEqual(first.executionId, second.executionId);
  assert.match(graph.diagram(), /flowchart LR/);
});

test("undefined is a valid successful result", async () => {
  const item = defineTask({ key: "void", perform() {} });
  const result = await defineWorkflow("empty", [item]).start();
  assert.equal(result.value(item), undefined);
});

test("invalid numeric limits fail before execution", async () => {
  assert.throws(() =>
    defineTask({ key: "x", perform() {}, retry: { attempts: 0 } }),
  );
  assert.throws(() => defineTask({ key: "x", perform() {}, timeoutMs: -1 }));
  await assert.rejects(defineWorkflow("empty", []).start({ concurrency: 0 }));
});
