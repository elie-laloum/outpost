import assert from "node:assert/strict";
import { test } from "node:test";
import { observeDispatch } from "../../src/application/dispatch-observation.ts";
import type { DispatchTelemetryOutcome } from "../../src/index.ts";

test("failure usage replaces streamed totals with authoritative summaries across repeated pass numbers", async () => {
  const outcomes: DispatchTelemetryOutcome[] = [];
  const error = new Error("synchronization failed");
  await assert.rejects(
    observeDispatch(
      {
        brief: { text: "test" },
        telemetry: {
          startDispatch() {
            return {
              finish(outcome) {
                outcomes.push(outcome);
              },
            };
          },
        },
      },
      async (options) => {
        const common = { pass: 1, at: new Date().toISOString() };
        options.observe?.({
          ...common,
          kind: "phase",
          name: "preparing prompt",
        });
        options.observe?.({
          ...common,
          kind: "usage",
          tokens: { input: 10, cached: 0, output: 3 },
        });
        options.observe?.({
          ...common,
          kind: "summary",
          status: 0,
          durationMs: 1,
          tokens: { input: 8, cached: 2, output: 4 },
        });
        options.observe?.({
          ...common,
          kind: "phase",
          name: "preparing prompt",
        });
        options.observe?.({
          ...common,
          kind: "usage",
          tokens: { input: 2, cached: 1, output: 1 },
        });
        throw error;
      },
    ),
    (cause) => cause === error,
  );
  assert.equal(outcomes[0]?.status, "failed");
  assert.deepEqual(outcomes[0]?.usage, { input: 10, cached: 3, output: 5 });
});
