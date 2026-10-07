import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateUsageCost,
  defineTask,
  defineWorkflow,
  WorkflowBudgetExceeded,
  WorkflowCostUnavailable,
} from "../../src/index.ts";
import type { ModelPriceTable, Usage } from "../../src/index.ts";
import {
  addUsage,
  usageDifference,
  modelUsage,
  validateUsage,
} from "../../src/domain/usage.ts";
import { workflowAccounting } from "../../src/domain/workflow/budget.ts";

const prices: ModelPriceTable = {
  currency: "EUR",
  models: {
    a: { input: 2, cached: 0.5, cacheCreated: 3, output: 8 },
    b: { input: 1, output: 4 },
  },
};
const tokens = {
  input: 1_000_000,
  cached: 200_000,
  cacheCreated: 100_000,
  output: 100_000,
};
const usage: Usage = modelUsage(tokens, "a");

test("cost prices cache reads and writes separately without double counting", () => {
  assert.deepEqual(calculateUsageCost(usage, prices), {
    currency: "EUR",
    amount: 2.6,
    complete: true,
  });
  const combined = addUsage(
    usage,
    modelUsage({ input: 1_000_000, cached: 100_000, output: 0 }, "b"),
  );
  assert.deepEqual(calculateUsageCost(combined, prices), {
    currency: "EUR",
    amount: 3.6,
    complete: true,
  });
  assert.deepEqual(usageDifference(combined, usage).models?.b, {
    input: 1_000_000,
    cached: 100_000,
    output: 0,
  });
  assert.equal(
    calculateUsageCost(
      modelUsage({ input: 1, cached: 0, output: 0 }, "toString"),
      prices,
    ).complete,
    false,
  );
  assert.equal(calculateUsageCost(tokens, prices).complete, false);
  assert.equal(
    calculateUsageCost({ ...usage, complete: false }, prices).complete,
    false,
  );
});

test("invalid prices, currencies and model counters fail explicitly", () => {
  for (const rate of [-1, Infinity, NaN])
    assert.throws(() =>
      calculateUsageCost(usage, {
        currency: "USD",
        models: { a: { input: rate, output: 1 } },
      }),
    );
  assert.throws(
    () =>
      calculateUsageCost(
        modelUsage({ input: 1, cached: 2, output: 0 }, "a"),
        prices,
      ),
    /included/,
  );
  for (const malformed of [
    null,
    { input: 0, cached: 0, output: 0, models: [] },
    { ...tokens, models: { a: { input: 2_000_000, cached: 0, output: 0 } } },
    { ...tokens, models: { a: { ...tokens, models: {} } } },
  ])
    assert.throws(() => validateUsage(malformed));
  assert.throws(
    () =>
      workflowAccounting(
        { cost: { currency: "USD", limit: 1 }, prices },
        () => {},
      ),
    /same currency/,
  );
  assert.throws(() =>
    workflowAccounting(
      { cost: { currency: "EUR", limit: NaN }, prices },
      () => {},
    ),
  );
});

test("monetary exhaustion cancels work and unknown prices fail even with attempt limits", async () => {
  const metered = defineTask({
    key: "meter",
    perform(context) {
      context.reportUsage(usage);
      return 1;
    },
  });
  const child = defineTask({
    key: "child",
    after: [metered],
    perform: () => assert.fail("must not start"),
  });
  const result = await defineWorkflow("cost", [metered, child]).start({
    budget: { prices, cost: { currency: "EUR", limit: 2 } },
  });
  assert.equal(result.status, "failed");
  assert.equal(result.terminationCode, "limit");
  assert.equal(result.usage.cost?.amount, 2.6);
  assert.ok(result.errors[0] instanceof WorkflowBudgetExceeded);
  assert.equal(result.errors[0].dimension, "cost");
  const unknown = defineTask({
    key: "unknown",
    perform(context) {
      context.reportUsage(tokens);
    },
  });
  const stopped = await defineWorkflow("unknown", [unknown]).start({
    budget: { attempts: 5, prices, cost: { currency: "EUR", limit: 20 } },
  });
  assert.ok(stopped.errors[0] instanceof WorkflowCostUnavailable);
  assert.equal(stopped.terminationCode, "usage-unavailable");
  assert.equal(stopped.usage.cost?.complete, false);
  const zero = await defineWorkflow("zero", [child, metered]).start({
    budget: { prices, cost: { currency: "EUR", limit: 0 } },
  });
  assert.equal(zero.usage.attempts, 0);
});

test("accounting restores model totals, deduplicates reports and isolates snapshots", async () => {
  const accounting = workflowAccounting({ prices }, () => assert.fail());
  accounting.admit();
  accounting.report(usage);
  const saved = accounting.snapshot();
  const resumed = workflowAccounting({ prices }, () => assert.fail(), saved);
  resumed.report(modelUsage({ input: 1_000_000, cached: 0, output: 0 }, "b"));
  assert.equal(resumed.snapshot().cost?.amount, 3.6);
  assert.equal(saved.cost?.amount, 2.6);
  const task = defineTask({
    key: "once",
    perform(context) {
      context.reportUsageOnce!("same", usage);
      context.reportUsageOnce!("same", usage);
    },
  });
  const result = await defineWorkflow("once", [task]).start({
    budget: { prices },
  });
  result.unwrap();
  assert.equal(result.usage.cost?.amount, 2.6);
});

test("uncached CLI input is priced without subtracting cache twice", () => {
  const cli = modelUsage(
    { input: 700_000, cached: 200_000, cacheCreated: 100_000, output: 100_000 },
    "a",
    false,
  );
  assert.equal(calculateUsageCost(cli, prices).amount, 2.6);
  assert.equal(
    calculateUsageCost(
      modelUsage({ input: 0, cached: 10, output: 0 }, "unknown", false),
      prices,
    ).complete,
    false,
  );
  assert.throws(() => addUsage(cli, usage), /different cache conventions/);
});

test("queue result boundaries preserve model prices and usage completeness", async () => {
  const { queueResult } = await import("../../src/domain/task-queue.ts");
  const parsed = queueResult({
    value: null,
    usage: { ...usage, complete: false },
  });
  assert.deepEqual(parsed.usage, { ...usage, complete: false });
  assert.equal(calculateUsageCost(parsed.usage!, prices).complete, false);
  assert.throws(() =>
    queueResult({
      value: null,
      usage: { ...tokens, models: { a: { ...tokens, output: -1 } } },
    }),
  );
});
