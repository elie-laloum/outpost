import assert from "node:assert/strict";
import { test } from "node:test";
import { createBudgetControl } from "../../src/domain/budget-control.ts";
import {
  WorkflowBudgetExceeded,
  WorkflowCostUnavailable,
  WorkflowUsageUnavailable,
} from "../../src/domain/workflow/budget.ts";

test("attempt exhaustion permits active work until its usage exhausts another limit", () => {
  const errors: Error[] = [];
  const { accounting, signal } = createBudgetControl({
    signal: undefined,
    budget: { attempts: 2, usage: { input: 5 } },
    initialUsage: { attempts: 1, tokens: { input: 2, cached: 0, output: 0 } },
    onExhausted(error) {
      assert.equal(signal.aborted, false);
      errors.push(error);
    },
  });
  accounting.admit();
  assert.throws(() => accounting.admit(), WorkflowBudgetExceeded);
  assert.equal(accounting.exhausted, true);
  assert.equal(signal.aborted, false);
  accounting.report({ input: 3, cached: 0, output: 1 });
  assert.equal(signal.aborted, true);
  assert.equal(signal.reason, errors[1]);
  assert.equal(errors.length, 2);
  assert.deepEqual(accounting.snapshot(), {
    attempts: 2,
    tokens: { input: 5, cached: 0, output: 1 },
  });
});

for (const [name, budget, ErrorType] of [
  ["token limit", { usage: { input: 1 } }, WorkflowBudgetExceeded],
  ["unknown usage", { usage: { input: 10 } }, WorkflowUsageUnavailable],
  [
    "unknown cost despite an attempt limit",
    {
      attempts: 2,
      prices: { currency: "EUR", models: {} },
      cost: { currency: "EUR", limit: 1 },
    },
    WorkflowCostUnavailable,
  ],
] as const) {
  test(`${name} aborts with the recorded error`, () => {
    let recorded: Error | undefined;
    const { accounting, signal } = createBudgetControl({
      signal: undefined,
      budget,
      initialUsage: undefined,
      onExhausted(error) {
        assert.equal(signal.aborted, false);
        recorded = error;
      },
    });
    accounting.admit();
    accounting.report({
      input: 1,
      cached: 0,
      output: 0,
      ...(name === "unknown usage" ? { complete: false } : {}),
    });
    assert.ok(recorded instanceof ErrorType);
    assert.equal(signal.aborted, true);
    assert.equal(signal.reason, recorded);
    assert.equal(accounting.snapshot().tokens.input, 1);
  });
}

for (const alreadyAborted of [false, true]) {
  test(`external cancellation preserves its reason (already aborted: ${alreadyAborted})`, () => {
    const caller = new AbortController();
    const reason = new Error("caller stopped");
    if (alreadyAborted) caller.abort(reason);
    const { signal, stop } = createBudgetControl({
      signal: caller.signal,
      budget: undefined,
      initialUsage: undefined,
      onExhausted: () => assert.fail("cancellation is not budget exhaustion"),
    });
    if (!alreadyAborted) caller.abort(reason);
    stop.abort(new Error("later internal stop"));
    assert.equal(signal.reason, reason);
    assert.equal(caller.signal.reason, reason);
  });
}

test("internal cancellation leaves the caller's signal available for other work", () => {
  const caller = new AbortController();
  const { signal, stop } = createBudgetControl({
    signal: caller.signal,
    budget: undefined,
    initialUsage: undefined,
    onExhausted: () => assert.fail("cancellation is not budget exhaustion"),
  });
  const reason = new Error("candidate selected");
  stop.abort(reason);
  assert.equal(signal.reason, reason);
  assert.equal(caller.signal.aborted, false);
});
