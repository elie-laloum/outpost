---
title: "Export workflow telemetry"
description: "Structured workflow events, private metrics and injected OpenTelemetry exporters."
sidebar:
  order: 5
---

`WorkflowOptions.observe` receives `start`, `task`, `attempt`, `retry`, `usage` and `finish` events. Each includes `executionId`, workflow name and an ISO `timestamp`; task events include a key and status, admissions include the one-based attempt, usage events contain deltas, and terminal events include status and, for started work, elapsed `durationMs`. Task duration includes condition evaluation, retries and retry delays. `WorkflowResult.usage` contains the aggregate counters, including failed attempts. Observer exceptions are collected in `observerErrors` without changing the execution outcome.

## OpenTelemetry

Install the optional API alongside your chosen SDK and exporter. The base Outpost import does not load OpenTelemetry. The adapter is available through `@elie-laloum/outpost/opentelemetry` and accepts an injected `Tracer` and `Meter`; it does not configure global providers or a network destination.

```sh
npm install @opentelemetry/api @opentelemetry/sdk-trace-base @opentelemetry/sdk-metrics
```

This self-contained example exports to memory, without credentials, agents or network traffic:

```ts
import { task, workflow } from "@elie-laloum/outpost";
import { openTelemetry } from "@elie-laloum/outpost/opentelemetry";
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
const telemetry = openTelemetry({
  tracer: tracer.getTracer("my-workflows"),
  meter: meter.getMeter("my-workflows"),
});
try {
  const inspect = task({
    key: "inspect",
    perform(context) {
      context.reportUsage({ input: 10, cached: 0, output: 2 });
    },
  });
  const result = await workflow("inspection", [inspect]).start({
    observe: telemetry.observe,
    budget: { usage: { output: 100 } },
  });
  result.unwrap();
  await tracer.forceFlush();
  await meter.forceFlush();
  console.log(spans.getFinishedSpans().map((span) => span.name));
  console.log(metrics.getMetrics());
} finally {
  telemetry.close();
  await tracer.shutdown();
  await meter.shutdown();
}
```

Use one adapter for multiple concurrent workflow executions. Each workflow has a span named `outpost.workflow`, children named `outpost.task`, and attempt children named `outpost.task.attempt`. A workflow span uses the active OpenTelemetry context at the `start` event as its parent. The adapter explicitly parents its own spans; it does not activate task spans for arbitrary instrumentation inside `perform`. Failed attempts close on retry, and all spans close on completion or cancellation. Ordinary skipped tasks retain an unset OpenTelemetry status; failures and cancellation use error status. `close()` is idempotent, closes unfinished spans as cancelled and stops accepting events. It does not flush or shut down your SDK.

Use `agentTask` and `isolatedTask` to include automatic model usage; a direct `dispatch()` uses the separate `telemetry` option. See [usage budgets](../../../workflows/budgets/) for reporting custom task usage and understanding summary corrections.

## Metrics and privacy

| Instrument                      | Kind      | Unit / attributes                                                            |
| ------------------------------- | --------- | ---------------------------------------------------------------------------- |
| `outpost.workflow.executions`   | Counter   | `outpost.status`                                                             |
| `outpost.task.executions`       | Counter   | `outpost.status`, including skipped and unstarted cancelled tasks            |
| `outpost.task.attempts`         | Counter   | Admitted attempts                                                            |
| `outpost.task.retries`          | Counter   | Scheduled retries, including a retry later denied by a budget                |
| `outpost.agent.tokens`          | Counter   | `{token}`, `outpost.token.type`: `input`, `cached`, `cacheCreated`, `output` |
| `outpost.workflow.duration`     | Histogram | Seconds, `outpost.status`                                                    |
| `outpost.task.duration`         | Histogram | Seconds, `outpost.status`; started tasks only                                |
| `outpost.task.attempt.duration` | Histogram | Seconds, `outpost.status`                                                    |

The adapter never exports workflow names, task keys, execution IDs, prompts, transcripts, repository paths, commands, tool inputs or exception messages. Its span names are fixed and metric attributes use only bounded status/token categories. Standard SDK resources and any parent spans remain under your control. Full raw observations and JSONL logs have different privacy properties; see [events and logs](../../../agents/observability/).

Telemetry API failures are isolated, including optional `onError(error)` failures. A broken instrument can lose telemetry without failing the workflow. Diagnose exporter delivery through your SDK, and call its flush/shutdown operations before process exit. See the official [OpenTelemetry JavaScript instrumentation guide](https://opentelemetry.io/docs/languages/js/instrumentation/) for SDK and exporter configuration.

Repository contributors can run `node test/fixtures/workflow-observability.ts` after `npm ci`. It exercises retries, a usage budget, real in-memory SDK exporters and lifecycle assertions without paid calls or external services.

## Complete dispatch telemetry

Pass `telemetry: openTelemetry({ tracer, meter })` to `dispatch()`, `workspace.dispatch()` or `sandbox.dispatch()`. Keep `observe` for agent events and reporters. Each public call owns one `outpost.dispatch` span, including all internal passes and repairs. A warm call excludes sandbox creation and later closure. Resume and fork start independent sessions when telemetry is configured.

The span ends after the operation settles, including cleanup errors. Status is `done` for resolved calls, `cancelled` for explicit cancellation, or `failed` for other rejections, including deadlines. `outpost.completed` records completion separately on success. Success uses result token totals; failures retain known consumption, reconciling pass summaries against streamed usage. Missing consumption is not estimated.

Dispatch metrics are `outpost.dispatch.executions`, `outpost.dispatch.duration` (seconds), and `outpost.dispatch.tokens` (input, cached, cacheCreated, output). They are separate from workflow metrics: do not sum dispatch and workflow tokens for the same work. No content, paths, tool inputs or error messages are exported. Only the active OpenTelemetry context supplies a parent; no automatic workflow task activation is added.

`close()` also closes unfinished dispatch sessions as cancelled and ignores later finishes. Close the adapter after awaited dispatches; early closure cannot include usage not yet supplied at completion. Flush and shut down your SDK separately. See the [executable dispatch example](../../../advanced/telemetry/#instrument-a-complete-dispatch).
