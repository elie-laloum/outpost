import assert from "node:assert/strict";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { SpanStatusCode } from "@opentelemetry/api";
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import {
  InMemoryMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
  AggregationTemporality,
} from "@opentelemetry/sdk-metrics";
import { task, workflow } from "../../src/index.ts";
import { openTelemetry } from "../../src/infrastructure/opentelemetry.ts";

function telemetry() {
  const spans = new InMemorySpanExporter();
  const tracer = new BasicTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(spans)],
  });
  const metrics = new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE);
  const meter = new MeterProvider({
    readers: [
      new PeriodicExportingMetricReader({
        exporter: metrics,
        exportIntervalMillis: 60_000,
      }),
    ],
  });
  return {
    spans,
    tracer,
    metrics,
    meter,
    observer: openTelemetry({
      tracer: tracer.getTracer("test"),
      meter: meter.getMeter("test"),
    }),
  };
}

test("official SDK exports parented spans, exact usage, retries and duration metrics without sensitive labels", async (t) => {
  const sdk = telemetry();
  t.after(async () => {
    sdk.observer.close();
    await sdk.tracer.shutdown();
    await sdk.meter.shutdown();
  });
  const run = task({
    key: "secret-task-token",
    retry: { attempts: 2 },
    perform(context) {
      context.reportUsage({ input: 3, cached: 1, output: 2, cacheCreated: 4 });
      if (context.attempt === 1) throw new Error("secret-error-prompt");
      return "secret-output";
    },
  });
  const result = await workflow("secret-workflow", [run]).start({
    observe: sdk.observer.observe,
  });
  result.unwrap();
  await sdk.tracer.forceFlush();
  await sdk.meter.forceFlush();
  const spans = sdk.spans.getFinishedSpans();
  assert.equal(spans.length, 4);
  const root = spans.find((span) => span.name === "outpost.workflow")!;
  const taskSpan = spans.find((span) => span.name === "outpost.task")!;
  const attempts = spans.filter((span) => span.name === "outpost.task.attempt");
  assert.equal(taskSpan.parentSpanContext?.spanId, root.spanContext().spanId);
  assert.ok(
    attempts.every(
      (span) =>
        span.parentSpanContext?.spanId === taskSpan.spanContext().spanId,
    ),
  );
  assert.deepEqual(
    attempts.map((span) => span.status.code),
    [SpanStatusCode.ERROR, SpanStatusCode.OK],
  );
  assert.equal(root.status.code, SpanStatusCode.OK);
  const metrics = sdk.metrics
    .getMetrics()
    .flatMap((batch) => batch.scopeMetrics.flatMap((scope) => scope.metrics));
  const points = (name: string) =>
    metrics.find((metric) => metric.descriptor.name === name)!.dataPoints;
  assert.equal(points("outpost.task.attempts")[0]!.value, 2);
  assert.equal(points("outpost.task.retries")[0]!.value, 1);
  assert.equal(points("outpost.workflow.executions")[0]!.value, 1);
  assert.deepEqual(
    Object.fromEntries(
      points("outpost.agent.tokens").map((point) => [
        point.attributes["outpost.token.type"],
        point.value,
      ]),
    ),
    { input: 6, cached: 2, output: 4, cacheCreated: 8 },
  );
  for (const name of [
    "outpost.workflow.duration",
    "outpost.task.duration",
    "outpost.task.attempt.duration",
  ]) {
    assert.equal(
      metrics.find((metric) => metric.descriptor.name === name)?.descriptor
        .unit,
      "s",
    );
    assert.ok(points(name).length > 0);
  }
  const exported = JSON.stringify({
    spans: spans.map((span) => ({
      name: span.name,
      attributes: span.attributes,
      events: span.events,
      status: span.status,
    })),
    metrics,
  });
  assert.doesNotMatch(exported, /secret-/);
  assert.doesNotMatch(exported, new RegExp(result.executionId));
});

test("cancellation, skipped tasks and concurrent executions close every span", async (t) => {
  const sdk = telemetry();
  t.after(async () => {
    sdk.observer.close();
    await sdk.tracer.shutdown();
    await sdk.meter.shutdown();
  });
  const abort = new AbortController();
  const slow = task({
    key: "slow",
    async perform(context) {
      abort.abort("secret cancellation");
      await delay(100, undefined, { signal: context.signal });
    },
  });
  const skipped = task({
    key: "skip",
    condition: () => false,
    perform: () => assert.fail(),
  });
  const [cancelled, done] = await Promise.all([
    workflow("cancel", [slow]).start({
      signal: abort.signal,
      observe: sdk.observer.observe,
    }),
    workflow("done", [skipped]).start({ observe: sdk.observer.observe }),
  ]);
  assert.equal(cancelled.status, "cancelled");
  done.unwrap();
  const spans = sdk.spans.getFinishedSpans();
  assert.equal(spans.length, 5);
  assert.equal(
    spans.filter((span) => span.attributes["outpost.status"] === "cancelled")
      .length,
    3,
  );
  assert.equal(
    spans.find((span) => span.attributes["outpost.status"] === "skipped")
      ?.status.code,
    SpanStatusCode.UNSET,
  );
  const count = spans.length;
  sdk.observer.close();
  sdk.observer.close();
  assert.equal(sdk.spans.getFinishedSpans().length, count);
});

test("close drains unfinished spans without owning the injected SDK lifecycle", async (t) => {
  const sdk = telemetry();
  t.after(async () => {
    await sdk.tracer.shutdown();
    await sdk.meter.shutdown();
  });
  const event = {
    executionId: "id",
    workflow: "secret",
    timestamp: new Date().toISOString(),
  };
  sdk.observer.observe({ ...event, type: "start" });
  sdk.observer.observe({ ...event, type: "start" });
  sdk.observer.observe({
    ...event,
    type: "task",
    key: "one",
    status: "active",
  });
  sdk.observer.observe({ ...event, type: "attempt", key: "one", attempt: 1 });
  sdk.observer.close();
  assert.equal(sdk.spans.getFinishedSpans().length, 3);
  sdk.observer.observe({ ...event, type: "start" });
  sdk.tracer.getTracer("owner").startSpan("still usable").end();
  assert.equal(sdk.spans.getFinishedSpans().length, 4);
});

test("throwing telemetry APIs and diagnostics never affect workflow outcomes or leak spans", async (t) => {
  const sdk = telemetry();
  t.after(async () => {
    sdk.observer.close();
    await sdk.tracer.shutdown();
    await sdk.meter.shutdown();
  });
  const tracer = sdk.tracer.getTracer("throwing");
  const original = tracer.startSpan.bind(tracer);
  let errors = 0;
  const observer = openTelemetry({
    tracer: {
      ...tracer,
      startActiveSpan: tracer.startActiveSpan.bind(tracer),
      startSpan(...args) {
        const span = original(...args);
        span.setStatus = () => {
          throw new Error("broken status hook");
        };
        return span;
      },
    },
    meter: sdk.meter.getMeter("throwing"),
    onError() {
      errors++;
      throw new Error("broken diagnostic");
    },
  });
  const result = await workflow("safe", [
    task({ key: "run", perform: () => 1 }),
  ]).start({ observe: observer.observe });
  result.unwrap();
  observer.close();
  assert.equal(errors, 3);
  assert.equal(sdk.spans.getFinishedSpans().length, 3);
  const broken = openTelemetry({
    tracer,
    meter: {
      ...sdk.meter.getMeter("broken"),
      createCounter() {
        throw new Error("counter");
      },
      createHistogram() {
        throw new Error("histogram");
      },
    },
  });
  const safe = await workflow("safe", []).start({ observe: broken.observe });
  safe.unwrap();
  broken.close();
});

test("paused workflows end neutral spans and rejected gates end error spans", async (t) => {
  const sdk = telemetry();
  t.after(async () => {
    sdk.observer.close();
    await sdk.tracer.shutdown();
    await sdk.meter.shutdown();
  });
  const event = {
    executionId: "gate-run",
    workflow: "gate-workflow",
    timestamp: new Date().toISOString(),
  };
  sdk.observer.observe({ ...event, type: "start" });
  sdk.observer.observe({
    ...event,
    type: "task",
    key: "review",
    status: "paused",
  });
  sdk.observer.observe({ ...event, type: "finish", status: "paused" });
  sdk.observer.observe({ ...event, type: "start" });
  sdk.observer.observe({
    ...event,
    type: "task",
    key: "review",
    status: "active",
  });
  sdk.observer.observe({
    ...event,
    type: "task",
    key: "review",
    status: "rejected",
  });
  sdk.observer.observe({ ...event, type: "finish", status: "failed" });
  const spans = sdk.spans.getFinishedSpans();
  assert.equal(spans.length, 3);
  assert.equal(spans[0]!.status.code, SpanStatusCode.UNSET);
  assert.equal(spans[0]!.attributes["outpost.status"], "paused");
  assert.equal(spans[1]!.status.code, SpanStatusCode.ERROR);
  assert.equal(spans[1]!.attributes["outpost.status"], "rejected");
  assert.equal(spans[2]!.status.code, SpanStatusCode.ERROR);
  await sdk.meter.forceFlush();
  const metrics = sdk.metrics
    .getMetrics()
    .flatMap((batch) => batch.scopeMetrics.flatMap((scope) => scope.metrics));
  const tasks = metrics.find(
    (metric) => metric.descriptor.name === "outpost.task.executions",
  )!;
  assert.ok(
    tasks.dataPoints.some(
      (point) => point.attributes["outpost.status"] === "paused",
    ),
  );
  assert.ok(
    tasks.dataPoints.some(
      (point) => point.attributes["outpost.status"] === "rejected",
    ),
  );
});
