import assert from "node:assert/strict";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import {
  defineTask,
  defineWorkflow,
  WorkflowBudgetExceeded,
} from "../../src/index.ts";
import type { TaskContext, Usage, WorkflowEvent } from "../../src/index.ts";

test("attempt admission is shared across concurrency and retries", async () => {
  const admitted: string[] = [];
  const tasks = ["a", "b", "c"].map((key) =>
    defineTask({
      key,
      retry: { attempts: 3 },
      async perform(context) {
        admitted.push(`${key}:${context.attempt}`);
        await delay(2);
        throw new Error("retry");
      },
    }),
  );
  const result = await defineWorkflow("attempts", tasks).start({
    concurrency: 2,
    stopOnError: false,
    budget: { attempts: 2 },
  });
  assert.equal(result.status, "failed");
  assert.equal(result.terminationCode, "limit");
  assert.equal(result.usage.attempts, 2);
  assert.equal(admitted.length, 2);
  assert.equal(
    result.errors.filter((error) => error instanceof WorkflowBudgetExceeded)
      .length,
    1,
  );
  assert.ok(result.tasks.every((entry) => entry.status === "cancelled"));
});

test("the last admitted attempt can finish and false conditions consume no admission", async () => {
  const skipped = defineTask({
    key: "skipped",
    condition: () => false,
    perform: () => assert.fail(),
  });
  const run = defineTask({
    key: "run",
    async perform() {
      await delay(2);
      return 7;
    },
  });
  const result = await defineWorkflow("exact", [skipped, run]).start({
    budget: { attempts: 1 },
  });
  result.unwrap();
  assert.equal(result.value(run), 7);
  assert.equal(result.usage.attempts, 1);
});

test("zero budgets prevent the first perform and invalid limits reject before observers", async () => {
  const run = defineTask({ key: "never", perform: () => assert.fail() });
  for (const budget of [{ attempts: 0 }, { usage: { input: 0 } }]) {
    const result = await defineWorkflow("zero", [run]).start({ budget });
    assert.equal(result.status, "failed");
    assert.equal(result.usage.attempts, 0);
    assert.ok(result.errors[0] instanceof WorkflowBudgetExceeded);
  }
  for (const value of [-1, 0.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) {
    await assert.rejects(
      defineWorkflow("invalid", [run]).start({
        budget: { usage: { output: value } },
        observe: () => assert.fail(),
      }),
      /safe integer/,
    );
  }
});

test("usage includes failed retries, cancels concurrent tasks and awaits their cleanup", async () => {
  let release!: () => void;
  const ready = new Promise<void>((resolve) => {
    release = resolve;
  });
  let cleaned = false;
  const sibling = defineTask({
    key: "sibling",
    async perform(context) {
      release();
      try {
        await delay(10_000, undefined, { signal: context.signal });
      } finally {
        context.reportUsage({ input: 1, cached: 0, output: 0 });
        cleaned = true;
      }
    },
  });
  const run = defineTask({
    key: "run",
    retry: { attempts: 3 },
    async perform(context) {
      await ready;
      context.reportUsage({ input: 3, cached: 2, output: 1 });
      throw new Error("failed work is billed too");
    },
  });
  const events: WorkflowEvent[] = [];
  const result = await defineWorkflow("usage", [sibling, run]).start({
    concurrency: 2,
    budget: { usage: { input: 6 } },
    observe(event) {
      events.push(event);
      throw new Error("observer");
    },
  });
  assert.equal(result.status, "failed");
  assert.equal(cleaned, true);
  assert.deepEqual(result.usage, {
    attempts: 3,
    tokens: { input: 7, cached: 4, output: 2 },
  });
  assert.equal(result.errors.length, 1);
  const error = result.errors[0];
  assert.ok(error instanceof WorkflowBudgetExceeded);
  assert.equal(error.dimension, "input");
  assert.equal(error.observed, 6);
  assert.equal(result.observerErrors.length, events.length);
  assert.ok(
    events.some(
      (event) =>
        event.type === "finish" &&
        event.status === "failed" &&
        typeof event.durationMs === "number",
    ),
  );
  assert.ok(Object.isFrozen(result.usage.tokens));
});

test("each usage dimension is independently enforceable and contexts cannot report late", async () => {
  let saved!: TaskContext;
  for (const dimension of [
    "input",
    "cached",
    "output",
    "cacheCreated",
  ] as const) {
    const run = defineTask({
      key: "run",
      perform(context) {
        saved = context;
        const usage: Usage = { input: 0, cached: 0, output: 0, [dimension]: 4 };
        context.reportUsage(usage);
      },
    });
    const result = await defineWorkflow("dimension", [run]).start({
      budget: { usage: { [dimension]: 3 } },
    });
    assert.equal(result.status, "failed");
    assert.equal(result.usage.tokens[dimension], 4);
    assert.throws(
      () => saved.reportUsage({ input: 1, cached: 0, output: 0 }),
      /active task attempt/,
    );
  }
});

test("invalid reported usage fails atomically without corrupting accounting", async () => {
  const run = defineTask({
    key: "run",
    perform(context) {
      context.reportUsage({ input: 3, cached: -1, output: 0 });
    },
  });
  const result = await defineWorkflow("invalid", [run]).start();
  assert.equal(result.status, "failed");
  assert.deepEqual(result.usage.tokens, { input: 0, cached: 0, output: 0 });
});

test("budgets and usage are fresh for each execution of a graph", async () => {
  const run = defineTask({
    key: "run",
    perform(context) {
      context.reportUsage({ input: 2, cached: 0, output: 1 });
    },
  });
  const graph = defineWorkflow("repeat", [run]);
  for (let i = 0; i < 2; i++) {
    const result = await graph.start({
      budget: { attempts: 1, usage: { input: 3 } },
    });
    result.unwrap();
    assert.deepEqual(result.usage.tokens, { input: 2, cached: 0, output: 1 });
  }
});

test("denied admission drains an already admitted concurrent task", async () => {
  const first = defineTask({
    key: "first",
    async perform(context) {
      await delay(5);
      assert.equal(context.signal.aborted, false);
      return 9;
    },
  });
  const second = defineTask({ key: "second", perform: () => assert.fail() });
  const result = await defineWorkflow("drain", [first, second]).start({
    concurrency: 2,
    budget: { attempts: 1 },
  });
  assert.equal(result.status, "failed");
  assert.equal(result.value(first), 9);
  assert.deepEqual(
    result.tasks.map((entry) => entry.status),
    ["done", "cancelled"],
  );
  assert.equal(result.usage.attempts, 1);
});

test("token exhaustion still cancels admitted work after attempt admission closes", async () => {
  let reported = false;
  const first = defineTask({
    key: "first",
    async perform(context) {
      await delay(5);
      context.reportUsage({ input: 3, cached: 0, output: 0 });
      reported = true;
      assert.equal(context.signal.aborted, true);
    },
  });
  const second = defineTask({ key: "second", perform: () => assert.fail() });
  const result = await defineWorkflow("both", [first, second]).start({
    concurrency: 2,
    budget: { attempts: 1, usage: { input: 2 } },
  });
  assert.equal(reported, true);
  assert.equal(result.errors.length, 2);
  assert.equal(result.usage.tokens.input, 3);
  assert.ok(result.tasks.every((record) => record.status === "cancelled"));
});

test("usage from a settled retry cannot be reported during its retry delay", async () => {
  let previous!: TaskContext;
  const run = defineTask({
    key: "retry",
    retry: { attempts: 2 },
    perform(context) {
      previous = context;
      if (context.attempt === 1) throw new Error("retry");
    },
  });
  let checked = false;
  const result = await defineWorkflow("late", [run]).start({
    observe(event) {
      if (event.type !== "retry") return;
      assert.throws(
        () => previous.reportUsage({ input: 9, cached: 0, output: 0 }),
        /active task attempt/,
      );
      checked = true;
    },
  });
  result.unwrap();
  assert.equal(checked, true);
  assert.equal(result.observerErrors.length, 0);
  assert.equal(result.usage.tokens.input, 0);
});

test("a task throwing the public budget error without exhaustion still fails", async () => {
  const run = defineTask({
    key: "error",
    perform() {
      throw new WorkflowBudgetExceeded("attempts", 1, 1);
    },
  });
  const result = await defineWorkflow("error", [run]).start();
  assert.equal(result.status, "failed");
  assert.equal(result.tasks[0]?.status, "failed");
});

test("unavailable usage has a distinct workflow termination code", async () => {
  const run = defineTask({
    key: "usage",
    perform(context) {
      context.reportUsage({ input: 1, cached: 0, output: 0, complete: false });
    },
  });
  const result = await defineWorkflow("incomplete-usage", [run]).start({
    budget: { usage: { input: 10 } },
  });
  assert.equal(result.status, "failed");
  assert.equal(result.terminationCode, "usage-unavailable");
});
