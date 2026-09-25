import assert from "node:assert/strict";
import { test } from "node:test";
import {
  task,
  workflow,
  type WorkflowEvent,
  type WorkflowTelemetry,
} from "../../src/index.ts";

test("workflow telemetry and observers receive the full lifecycle independently", async () => {
  const events: WorkflowEvent[] = [];
  const observed: WorkflowEvent[] = [];
  const delivery: string[] = [];
  const telemetry: WorkflowTelemetry = {
    observe(event) {
      assert.equal(this, telemetry);
      events.push(event);
      delivery.push("telemetry");
    },
  };
  const step = task({
    key: "retry",
    retry: { attempts: 2 },
    perform(context) {
      context.reportUsage({ input: 2, cached: 0, output: 1 });
      if (context.attempt === 1) throw new Error("Retry this attempt");
      return 42;
    },
  });
  const result = await workflow("instrumented", [step]).start({
    telemetry,
    observe(event) {
      observed.push(event);
      delivery.push("observe");
    },
  });
  result.unwrap();
  assert.equal(result.value(step), 42);
  assert.deepEqual(result.observerErrors, []);
  assert.deepEqual(events, observed);
  assert.deepEqual(
    delivery,
    events.flatMap(() => ["telemetry", "observe"]),
  );
  assert.deepEqual(
    events.map((event) => event.type),
    [
      "start",
      "task",
      "attempt",
      "usage",
      "retry",
      "attempt",
      "usage",
      "task",
      "finish",
    ],
  );
  assert.ok(events.every((event) => event.executionId === result.executionId));
  assert.ok(events.every((event) => event.workflow === "instrumented"));
  assert.equal(events.at(-1)?.status, "done");
  assert.deepEqual(result.usage.tokens, { input: 4, cached: 0, output: 2 });
});

test("telemetry and observer errors are collected without blocking each other or tasks", async () => {
  const telemetryError = new Error("telemetry failed");
  const observerError = new Error("observer failed");
  const telemetryEvents: WorkflowEvent[] = [];
  const observerEvents: WorkflowEvent[] = [];
  const step = task({ key: "succeed", perform: () => 42 });
  const result = await workflow("isolated", [step]).start({
    telemetry: {
      observe(event) {
        telemetryEvents.push(event);
        throw telemetryError;
      },
    },
    observe(event) {
      observerEvents.push(event);
      throw observerError;
    },
  });
  result.unwrap();
  assert.equal(result.value(step), 42);
  assert.deepEqual(telemetryEvents, observerEvents);
  assert.equal(telemetryEvents[0]?.type, "start");
  assert.equal(telemetryEvents.at(-1)?.type, "finish");
  assert.deepEqual(
    result.observerErrors,
    telemetryEvents.flatMap(() => [telemetryError, observerError]),
  );
  assert.deepEqual(result.errors, []);
});

test("a shared telemetry adapter remains caller-owned across workflow executions", async () => {
  const events: WorkflowEvent[] = [];
  let closes = 0;
  const telemetry = {
    observe(event: WorkflowEvent) {
      events.push(event);
    },
    close() {
      closes++;
    },
  };
  const flow = workflow("reusable", []);
  const results = await Promise.all([
    flow.start({ telemetry }),
    flow.start({ telemetry }),
  ]);
  for (const result of results) {
    result.unwrap();
    assert.deepEqual(
      events
        .filter((event) => event.executionId === result.executionId)
        .map((event) => event.type),
      ["start", "finish"],
    );
  }
  assert.notEqual(results[0]?.executionId, results[1]?.executionId);
  assert.equal(closes, 0);
});
