import assert from "node:assert/strict";
import { task, workflow, WorkflowBudgetExceeded } from "../../src/index.ts";
import { openTelemetry } from "../../src/infrastructure/opentelemetry.ts";
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import {
  MeterProvider,
  InMemoryMetricExporter,
  PeriodicExportingMetricReader,
  AggregationTemporality,
} from "@opentelemetry/sdk-metrics";

const spans = new InMemorySpanExporter();
const metrics = new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE);
const tracer = new BasicTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(spans)],
});
const meter = new MeterProvider({
  readers: [
    new PeriodicExportingMetricReader({
      exporter: metrics,
      exportIntervalMillis: 60_000,
    }),
  ],
});
const observer = openTelemetry({
  tracer: tracer.getTracer("outpost-fixture"),
  meter: meter.getMeter("outpost-fixture"),
});
try {
  const inspect = task({
    key: "inspect",
    retry: { attempts: 2 },
    perform(context) {
      context.reportUsage({ input: 4, cached: 1, output: 2 });
      throw new Error("Synthetic retry");
    },
  });
  const result = await workflow("local-observability-fixture", [inspect]).start(
    { telemetry: observer, budget: { attempts: 3, usage: { input: 8 } } },
  );
  assert.equal(result.status, "failed");
  assert.ok(result.errors[0] instanceof WorkflowBudgetExceeded);
  assert.equal(result.usage.tokens.input, 8);
  await tracer.forceFlush();
  await meter.forceFlush();
  assert.equal(spans.getFinishedSpans().length, 4);
  const names = metrics
    .getMetrics()
    .flatMap((batch) =>
      batch.scopeMetrics.flatMap((scope) =>
        scope.metrics.map((metric) => metric.descriptor.name),
      ),
    );
  assert.ok(names.includes("outpost.agent.tokens"));
  console.log(
    JSON.stringify(
      {
        status: result.status,
        usage: result.usage,
        spans: spans.getFinishedSpans().map((span) => ({
          name: span.name,
          status: span.attributes["outpost.status"],
        })),
        metrics: names,
      },
      null,
      2,
    ),
  );
} finally {
  observer.close();
  await tracer.shutdown();
  await meter.shutdown();
}
