import assert from "node:assert/strict";
import { test } from "node:test";
import { defineTask, defineWorkflow } from "../../src/index.ts";
import { taskUsageAccounting } from "../../src/application/task-usage.constants.ts";
import type { AgentObservation } from "../../src/index.ts";
import { taskUsage } from "../../src/application/task-usage.ts";

test("stream deltas, transcript summary corrections and final fallback reconcile without subtraction", async () => {
  let observed = 0;
  const run = defineTask({
    key: "usage",
    perform(context) {
      const observer = taskUsage(context, () => {
        observed++;
      });
      const observe = (event: AgentObservation) => {
        observer.dispatchOptions[taskUsageAccounting]!(event);
        observer.dispatchOptions.observe(event);
      };
      const at = new Date().toISOString();
      observe({
        kind: "usage",
        pass: 1,
        at,
        tokens: { input: 3, cached: 1, output: 1 },
      });
      observe({
        kind: "usage",
        pass: 1,
        at,
        tokens: { input: 2, cached: 1, output: 1 },
      });
      observe({
        kind: "summary",
        pass: 1,
        at,
        durationMs: 1,
        status: 0,
        tokens: { input: 8, cached: 1, output: 2, cacheCreated: 4 },
      });
      observe({
        kind: "summary",
        pass: 1,
        at,
        durationMs: 1,
        status: 0,
        tokens: { input: 8, cached: 1, output: 2, cacheCreated: 4 },
      });
      observe({
        kind: "summary",
        pass: 2,
        at,
        durationMs: 1,
        status: 0,
        tokens: { input: 1, cached: 0, output: 3 },
      });
      observer.reconcile({ input: 10, cached: 2, output: 5, cacheCreated: 4 });
      observer.reconcile({ input: 9, cached: 1, output: 5, cacheCreated: 4 });
    },
  });
  const result = await defineWorkflow("corrections", [run]).start();
  result.unwrap();
  assert.equal(observed, 5);
  assert.deepEqual(result.usage.tokens, {
    input: 10,
    cached: 2,
    output: 5,
    cacheCreated: 4,
  });
});

for (const delivery of ["throw", "stall"]) {
  test(`copied dispatch options account synchronously with a decorated ${delivery} observer`, async () => {
    const { observeDispatch } =
      await import("../../src/application/dispatch-observation.ts");
    const { createObservationHub } = await import("../../src/index.ts");
    let tokens = 0;
    const usage = taskUsage(
      {
        reportUsage(value) {
          tokens += value.input;
        },
      },
      undefined,
    );
    const settings = { ...usage.dispatchOptions };
    const result = await observeDispatch(
      {
        ...settings,
        brief: { text: "account" },
        logging: false,
        observation: createObservationHub({ deliveryTimeoutMs: 10 }),
        observe(event) {
          settings.observe(event);
          if (delivery === "throw") throw new Error("observer failed");
          return new Promise<void>(() => {});
        },
      },
      async (options) => {
        options.observe?.({
          kind: "usage",
          pass: 1,
          at: new Date().toISOString(),
          tokens: { input: 3, cached: 0, output: 0 },
        });
        assert.equal(
          tokens,
          3,
          "accounting must precede asynchronous delivery",
        );
        return { completed: true, usage: { input: 3, cached: 0, output: 0 } };
      },
    );
    usage.reconcile(result.usage);
    assert.equal(
      tokens,
      3,
      "delivery and final reconciliation must not double count",
    );
  });
}
