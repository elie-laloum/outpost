// Telemetry — OpenTelemetry spans and metrics for every dispatch and every workflow.
// Outpost bundles no SDK: you give it a tracer and a meter, and it feeds them.
//
// Here everything stays in memory so it can be printed at the end. In production, plug in
// the OTLP exporters (@opentelemetry/exporter-trace-otlp-http…) to Jaeger, Grafana, Honeycomb…

import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  defineTask,
  defineWorkflow,
  dispatch,
} from "@elie-laloum/outpost";
import { createOpenTelemetryObserver } from "@elie-laloum/outpost/opentelemetry";
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import {
  AggregationTemporality,
  InMemoryMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";

// 0. A minimal OpenTelemetry SDK that keeps spans and metrics in memory.
const spans = new InMemorySpanExporter();
const tracerProvider = new BasicTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(spans)],
});

const metrics = new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE);
const metricReader = new PeriodicExportingMetricReader({ exporter: metrics });
const meterProvider = new MeterProvider({ readers: [metricReader] });

// 1. A single Outpost observer for dispatches and workflows.
//    An SDK error goes through onError: it never makes the agent fail.
const telemetry = createOpenTelemetryObserver({
  tracer: tracerProvider.getTracer("outpost-demo"),
  meter: meterProvider.getMeter("outpost-demo"),
  onError: (error) => console.warn("télémétrie :", error),
});

const reader = createAgent({
  model,
  harness: createHarness({ modelProvider, tools: [createHarnessFileTools()] }),
});

// 2. A flaky task: it fails on the first attempt and succeeds on the second.
const warmup = defineTask({
  key: "warmup",
  retry: { attempts: 2 },
  perform: (context) => {
    if (context.attempt === 1) throw new Error("pas encore prêt");
  },
});

// 3. A task that launches a dispatch, instrumented as well.
const summarize = defineTask({
  key: "summarize",
  after: [warmup],
  perform: async (context) => {
    const result = await dispatch({
      repository: demoRepository(import.meta.dirname),
      sandboxProvider,
      agent: reader,
      brief: { file: join(import.meta.dirname, "brief.md") },
      signal: context.signal,
      telemetry, // → outpost.dispatch span (its own root, outside the task span)
    });

    context.reportUsage(result.usage); // → outpost.agent.tokens counter
    return result.text;
  },
});

const result = await defineWorkflow("telemetry-demo", [
  warmup,
  summarize,
]).start({ telemetry });
result.unwrap();

console.log("résumé :", result.value(summarize), "\n");

// 4. Close the observer, then flush the SDK buffers.
telemetry.close();
await tracerProvider.forceFlush();
await metricReader.forceFlush();

// 5. The spans, as a tree: each span then shows its children.
const finished = spans.getFinishedSpans();
const ms = ([seconds, nanoseconds]: [number, number]) =>
  seconds * 1000 + nanoseconds / 1e6;

function print(parentId: string | undefined, indent: string) {
  const children = finished
    .filter((span) => span.parentSpanContext?.spanId === parentId)
    .toSorted((a, b) => ms(a.startTime) - ms(b.startTime));

  for (const span of children) {
    console.log(
      `${indent}${span.name}  ${span.attributes["outpost.status"]}  ${Math.round(ms(span.duration))} ms`,
    );
    print(span.spanContext().spanId, indent + "  ");
  }
}

console.log("spans :");
print(undefined, "  ");

// 6. The metrics: counters and duration histograms.
console.log("\nmétriques :");

const { scopeMetrics } = metrics.getMetrics().at(-1)!; // cumulative values: the last collection is enough

for (const metric of scopeMetrics.flatMap((scope) => scope.metrics)) {
  for (const point of metric.dataPoints) {
    const value =
      typeof point.value === "number"
        ? point.value
        : `${point.value.count} mesure(s)`;
    console.log(`  ${metric.descriptor.name}`, point.attributes, "→", value);
  }
}
