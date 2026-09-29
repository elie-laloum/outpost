import assert from "node:assert/strict";
import { test } from "node:test";
import { observeDispatch } from "../../src/application/dispatch-observation.ts";
import { createObservationHub } from "../../src/index.ts";
import type { DispatchTelemetryOutcome } from "../../src/index.ts";

test("failure usage replaces streamed totals with authoritative summaries across repeated pass numbers", async () => {
  const outcomes: DispatchTelemetryOutcome[] = [];
  const error = new Error("synchronization failed");
  await assert.rejects(
    observeDispatch(
      {
        brief: { text: "test" },
        logging: false,
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

test(
  "an unresponsive journal cannot block dispatch completion",
  { timeout: 1000 },
  async () => {
    const result = await observeDispatch(
      {
        brief: { text: "test" },
        observation: createObservationHub({ deliveryTimeoutMs: 10 }),
        logging: {
          transporter: {
            name: "stalled",
            async read() {
              return undefined;
            },
            write() {
              return new Promise(() => {});
            },
            async remove() {},
            async *list() {},
          },
        },
      },
      async () => ({
        usage: { input: 0, cached: 0, output: 0 },
        completed: true,
      }),
    );
    assert.equal(result.completed, true);
  },
);
