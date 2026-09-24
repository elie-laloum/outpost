import assert from "node:assert/strict";
import { test } from "node:test";
import { task, workflow } from "../../src/index.ts";
import { taskUsage } from "../../src/application/task-usage.ts";

test("stream deltas, transcript summary corrections and final fallback reconcile without subtraction", async () => {
  let observed = 0;
  const run = task({
    key: "usage",
    perform(context) {
      const observer = taskUsage(context, () => {
        observed++;
      });
      const at = new Date().toISOString();
      observer.observe({
        kind: "usage",
        pass: 1,
        at,
        tokens: { input: 3, cached: 1, output: 1 },
      });
      observer.observe({
        kind: "usage",
        pass: 1,
        at,
        tokens: { input: 2, cached: 1, output: 1 },
      });
      observer.observe({
        kind: "summary",
        pass: 1,
        at,
        durationMs: 1,
        status: 0,
        tokens: { input: 8, cached: 1, output: 2, cacheCreated: 4 },
      });
      observer.observe({
        kind: "summary",
        pass: 1,
        at,
        durationMs: 1,
        status: 0,
        tokens: { input: 8, cached: 1, output: 2, cacheCreated: 4 },
      });
      observer.observe({
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
  const result = await workflow("corrections", [run]).start();
  result.unwrap();
  assert.equal(observed, 5);
  assert.deepEqual(result.usage.tokens, {
    input: 10,
    cached: 2,
    output: 5,
    cacheCreated: 4,
  });
});
