import assert from "node:assert/strict";
import { test } from "node:test";
import { setTimeout } from "node:timers/promises";
import {
  defineLoopTask,
  LoopTaskExhausted,
  defineTask,
  defineWorkflow,
} from "../../src/index.ts";
import type { LoopTaskContext, WorkflowEvent } from "../../src/index.ts";

test("loop feedback, dependency values, typed result and phase identities", async () => {
  const source = defineTask({ key: "source", perform: () => 10 });
  const seen: (string | undefined)[] = [];
  const contexts: LoopTaskContext[] = [];
  const events: WorkflowEvent[] = [];
  const fix = defineLoopTask({
    key: "fix",
    after: [source],
    maxRounds: 3,
    attempt(context, feedback) {
      contexts.push(context);
      seen.push(feedback);
      context.reportUsage({ input: 1, cached: 0, output: 2 });
      return context.value(source) + context.round;
    },
    check(context, value) {
      contexts.push(context);
      context.reportUsage({ input: 2, cached: 0, output: 1 });
      return value === 12
        ? { done: true }
        : { done: false, feedback: "Try again" };
    },
  });
  const result = await defineWorkflow("fix", [source, fix]).start({
    observe: (event) => events.push(event),
  });
  result.unwrap();
  assert.equal(result.value(fix), 12);
  assert.deepEqual(seen, [undefined, "Try again"]);
  assert.equal(new Set(contexts.map((ctx) => ctx.idempotencyKey)).size, 4);
  assert.deepEqual(result.usage, {
    attempts: 3,
    tokens: { input: 6, cached: 0, output: 6 },
  });
  assert.deepEqual(
    events.filter((e) => e.type === "loop").map((e) => [e.round, e.phase]),
    [
      [1, "attempt"],
      [1, "check"],
      [1, "complete"],
      [2, "attempt"],
      [2, "check"],
      [2, "complete"],
    ],
  );
  assert.equal(result.tasks[1]?.rounds?.length, 2);
});

test("exhaustion preserves feedback and blocks dependents", async () => {
  const fix = defineLoopTask({
    key: "fix",
    maxRounds: 2,
    attempt: () => 1,
    check: () => ({ done: false, feedback: "broken" }),
  });
  const dependent = defineTask({
    key: "dependent",
    after: [fix],
    perform: () => assert.fail("must not run"),
  });
  const result = await defineWorkflow("fix", [fix, dependent]).start({
    stopOnError: false,
  });
  assert.equal(result.status, "failed");
  const error = result.errors[0];
  assert.ok(error instanceof LoopTaskExhausted);
  assert.equal(error.key, "fix");
  assert.equal(error.maxRounds, 2);
  assert.equal(error.feedback, "broken");
  assert.equal(result.tasks[1]?.status, "skipped");
});

test("definition validation and workflow-only execution", () => {
  for (const maxRounds of [0, -1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1])
    assert.throws(
      () =>
        defineLoopTask({
          key: "x",
          maxRounds,
          attempt() {},
          check: () => ({ done: true }),
        }),
      /maxRounds/,
    );
  const fix = defineLoopTask({
    key: "x",
    maxRounds: 1,
    attempt() {},
    check: () => ({ done: true }),
  });
  assert.throws(
    () => fix.perform({} as LoopTaskContext),
    /executed by a workflow/,
  );
});

test("exceptions in either phase fail without implicitly retrying", async () => {
  for (const phase of ["attempt", "check"]) {
    let calls = 0;
    const expected = new Error(phase);
    const fix = defineLoopTask({
      key: "fix",
      maxRounds: 5,
      attempt() {
        calls++;
        if (phase === "attempt") throw expected;
        return 1;
      },
      check() {
        throw expected;
      },
    });
    const result = await defineWorkflow("fix", [fix]).start();
    assert.equal(result.status, "failed");
    assert.equal(result.errors[0], expected);
    assert.equal(calls, 1);
  }
});

test("cooperative cancellation and round timeout stop the loop", async () => {
  for (const phase of ["attempt", "check"]) {
    for (const timeout of [false, true]) {
      const controller = new AbortController();
      let calls = 0;
      async function wait(context: LoopTaskContext) {
        if (!timeout) controller.abort(new Error("stop"));
        await setTimeout(1000, undefined, { signal: context.signal });
      }
      const fix = defineLoopTask({
        key: "fix",
        maxRounds: 5,
        ...(timeout ? { timeoutMs: 5 } : {}),
        async attempt(ctx) {
          calls++;
          if (phase === "attempt") await wait(ctx);
          return 1;
        },
        async check(ctx) {
          await wait(ctx);
          return { done: false, feedback: "again" };
        },
      });
      const result = await defineWorkflow("fix", [fix]).start({
        signal: controller.signal,
      });
      assert.equal(result.status, timeout ? "failed" : "cancelled");
      assert.equal(result.terminationCode, timeout ? "timeout" : "aborted");
      assert.equal(calls, 1);
    }
  }
});

test("budgets admit each round and token exhaustion prevents review", async () => {
  let reviews = 0;
  const fix = defineLoopTask({
    key: "fix",
    maxRounds: 5,
    attempt(ctx) {
      ctx.reportUsage({ input: 2, cached: 0, output: 1 });
      return 1;
    },
    check() {
      reviews++;
      return { done: false, feedback: "again" };
    },
  });
  const limited = await defineWorkflow("fix", [fix]).start({
    budget: { attempts: 2 },
  });
  assert.equal(limited.status, "failed");
  assert.equal(limited.usage.attempts, 2);
  assert.equal(reviews, 2);
  const tokens = await defineWorkflow("fix", [fix]).start({
    budget: { usage: { input: 2 } },
  });
  assert.equal(tokens.status, "failed");
  assert.equal(tokens.usage.tokens.input, 2);
  assert.equal(reviews, 2);
});

test("reusable definitions have independent histories and permit non-JSON in memory", async () => {
  const fix = defineLoopTask({
    key: "fix",
    maxRounds: 1,
    attempt: () => new Date(0),
    check: (_, value) => ({ done: value.getTime() === 0, feedback: "date" }),
  });
  const results = await Promise.all([
    defineWorkflow("a", [fix]).start(),
    defineWorkflow("b", [fix]).start(),
  ]);
  for (const result of results) {
    result.unwrap();
    assert.ok(result.value(fix) instanceof Date);
    assert.equal(result.usage.attempts, 1);
  }
});

test("condition and observer failures preserve normal task behavior", async () => {
  const skipped = defineLoopTask({
    key: "skip",
    maxRounds: 1,
    condition: () => false,
    attempt: () => assert.fail(),
    check: () => ({ done: true }),
  });
  const fix = defineLoopTask({
    key: "fix",
    maxRounds: 1,
    attempt() {},
    check: () => ({ done: true }),
  });
  const result = await defineWorkflow("fix", [skipped, fix]).start({
    observe() {
      throw new Error("observer");
    },
  });
  result.unwrap();
  assert.equal(result.value(fix), undefined);
  assert.equal(result.tasks[0]?.status, "skipped");
  assert.ok(result.observerErrors.length > 0);
});
