---
title: "Observation hub and OpenTelemetry"
description: "Receive every event of a run through one hub and export traces with OpenTelemetry."
---

Collect workflow, agent and operation events in one place and export them as traces and metrics.

## Observe the whole run

Attach an `ObservationHub` through `observation` to receive workflow, agent and operation events through one receiver. Existing `observe` callbacks keep their agent or workflow event shape; they can be used alongside the hub.

```ts
import {
  createObservationHub,
  defineIsolatedTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const observation = createObservationHub({
  sinks: [
    {
      observe({ seq, source, scope, event }) {
        console.log(seq, source, scope.taskKey, scope.attempt, event.kind);
      },
    },
  ],
});
const review = defineIsolatedTask({
  key: "review",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: "Review the public API without modifying files." },
  }),
});
const result = await defineWorkflow("review", [review]).start({ observation });
result.unwrap();
await observation.close();
```

`seq` increases across a root hub and its children. `at` is Outpost's emission time. `scope` carries the known `executionId`, `taskKey`, `attempt`, `dispatchId`, `pass` and speculative `candidate`. `defineAgentTask` and `defineIsolatedTask` propagate task scope automatically; custom tasks pass `context.observation` to nested dispatches or speculation explicitly. Each dispatch emits its outcome after owned cleanup, including on failure.

Operation events pair a unique `id` with `started` and `finished` or `failed`; terminal events carry `durationMs`. They cover workspace preparation and locks, sandbox allocation and release, authentication/bootstrap, hooks, transfers, native conversations, synchronization and cleanup. Recovery planning, restoration, archival and retention helpers accept an optional hub as their final argument, kept outside serialized plans.

`defineCommandTask` streams stdout/stderr. Workflow events also expose gates, decisions, checkpoint persistence/resume and budget exhaustion. Speculative events identify the candidate. Queued tasks report enqueue, polling and completion/failure; remote worker events stay on the worker.

## Delivery and failure handling

Synchronous receivers run immediately; asynchronous receivers have independent ordered queues. The default capacity is 1,024 waiting envelopes per sink. Overflow drops the newest deliveries to that sink, increments `dropped` and records an error. A receiver exceeding `deliveryTimeoutMs` (5,000 ms by default) is disabled; its underlying promise cannot be forcibly cancelled. Synchronous user code must return promptly.

`flush()` drains the current delivery snapshot and receiver buffers. `close()` stops that scope and its descendants and drains its receivers; it does not close caller-owned parents. Dispatch and workflow entry points drain their owned scopes before returning. Failures are collected in `observerErrors` and the hub's bounded `errors` collection; they do not replace execution failures. A shared hub retains diagnostics across its uses. `createCustomReporter()` uses the same bounded delivery mechanism and its `flush()` rejects on reporting failure.

This is a live observation stream, not a durable state registry or an exactly-once delivery guarantee. Check `errors` and `dropped` before treating a captured trace as complete.

## Telemetry

Install `@opentelemetry/api` and import the adapter through `@elie-laloum/outpost/opentelemetry`. Workflow `telemetry` measures graph execution; dispatch `telemetry` measures preparation, agent execution, synchronization and cleanup. They are separate instrumentation boundaries.

```ts
import { trace, metrics } from "@opentelemetry/api";
import { createOpenTelemetryObserver } from "@elie-laloum/outpost/opentelemetry";

const telemetry = createOpenTelemetryObserver({
  tracer: trace.getTracer("outpost"),
  meter: metrics.getMeter("outpost"),
});
```

Register your OpenTelemetry SDK and exporters before creating these handles, then pass `telemetry` to the workflow or dispatch options. Without a registered SDK, these API handles do not export data.

The application owns tracer/meter provider shutdown. Instrumentation failures are isolated from execution outcomes. Custom reporting is available through `createCustomReporter()`.

API: [Logging](../../reference/logging/) · [readJournal](../../reference/readjournal/) · [createReplayAgent](../../reference/createreplayagent/) · [DispatchTelemetry](../../reference/dispatchtelemetry/) · [createCustomReporter](../../reference/createcustomreporter/).

## Correlate traces through the hub

Attach `telemetry.sink` to `createObservationHub({ sinks: [telemetry.sink] })`, then pass that hub through `observation`. This links workflow, task, attempt, dispatch and operation spans while retaining existing metric names. Use this wiring once per telemetry instance; combining it with legacy `telemetry` wiring for the same run would count events twice. OpenTelemetry remains an optional subpath dependency.

Dispatch journals are hub receivers. They contain scoped operations from preparation through cleanup and a terminal `dispatch-finished`, including early failures. `logging.verbose` retains raw events, deltas, stderr, reasoning and streamed tool output; the normal journal excludes these verbose events. Full model requests/responses additionally require `createObservationHub({ verbose: true })` before they are produced. Journal delivery failures are observation errors and can leave an incomplete journal; inspect `observerErrors` and hub diagnostics.
