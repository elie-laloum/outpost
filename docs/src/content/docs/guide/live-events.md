---
title: "Live events"
description: "Display progress while an agent runs."
---

Use `observe` for normalized agent events and `reporter()` for ready-made terminal output.

```ts
import { dispatch, reporter } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Summarize the public API without changing files." },
  observe: reporter({ label: "API review" }),
});
console.log(result.usage);
```

## Handle events yourself

An observation includes `kind`, `pass` and `at`. Narrow on `kind` before reading fields: `text-delta` carries text, `tool` identifies a call, and `usage` carries token counts. Unsupported protocol events may appear as `raw` observations.

Observers report progress; throwing inside one does not cancel the agent. Supply an abort signal to stop execution. Avoid sending raw events to a public log because tool arguments and output may include repository content.

## Instrument a workflow

`workflow.start({ observe })` emits task transitions, attempts, retries, usage and completion. Observer errors are collected in `observerErrors` independently of task errors. For metrics and traces use the optional [telemetry adapter](../audit-trails/).

API: [AgentObservation](../../reference/agentobservation/) · [reporter](../../reference/reporter/) · [WorkflowEvent](../../reference/workflowevent/).

## Observe the whole run

Attach an `ObservationHub` through `observation` to receive workflow, agent and operation events through one receiver. Existing `observe` callbacks keep their agent or workflow event shape; they can be used alongside the hub.

```ts
import {
  createObservationHub,
  isolatedTask,
  workflow,
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
const review = isolatedTask({
  key: "review",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: "Review the public API without modifying files." },
  }),
});
const result = await workflow("review", [review]).start({ observation });
result.unwrap();
await observation.close();
```

`seq` increases across a root hub and its children. `at` is Outpost's emission time. `scope` carries the known `executionId`, `taskKey`, `attempt`, `dispatchId`, `pass` and speculative `candidate`. `agentTask` and `isolatedTask` propagate task scope automatically; custom tasks pass `context.observation` to nested dispatches or speculation explicitly. Each dispatch emits its outcome after owned cleanup, including on failure.

Operation events pair a unique `id` with `started` and `finished` or `failed`; terminal events carry `durationMs`. They cover workspace preparation and locks, sandbox allocation and release, authentication/bootstrap, hooks, transfers, native conversations, synchronization and cleanup. Recovery planning, restoration, archival and retention helpers accept an optional hub as their final argument, kept outside serialized plans.

`commandTask` streams stdout/stderr. Workflow events also expose gates, decisions, checkpoint persistence/resume and budget exhaustion. Speculative events identify the candidate. Queued tasks report enqueue, polling and completion/failure; remote worker events stay on the worker.

## Delivery and failure handling

Synchronous receivers run immediately; asynchronous receivers have independent ordered queues. The default capacity is 1,024 waiting envelopes per sink. Overflow drops the newest deliveries to that sink, increments `dropped` and records an error. A receiver exceeding `deliveryTimeoutMs` (5,000 ms by default) is disabled; its underlying promise cannot be forcibly cancelled. Synchronous user code must return promptly.

`flush()` drains the current delivery snapshot and receiver buffers. `close()` stops that scope and its descendants and drains its receivers; it does not close caller-owned parents. Dispatch and workflow entry points drain their owned scopes before returning. Failures are collected in `observerErrors` and the hub's bounded `errors` collection; they do not replace execution failures. A shared hub retains diagnostics across its uses. `createReporter()` uses the same bounded delivery mechanism and its `flush()` rejects on reporting failure.

This is a live observation stream, not a durable state registry or an exactly-once delivery guarantee. Check `errors` and `dropped` before treating a captured trace as complete.

## CLI event coverage

Claude and Codex expose tool identifiers and results, and readable reasoning where present. Claude supports `claudeHarness({ partialMessages: true })`, emits per-message `message-usage` independently of authoritative turn totals, and preserves parent tool identifiers. Codex also emits structured `file-change` events. Copilot and Kimi correlate tool results using their native call identifiers. Antigravity uses its conversation and step index; a completed tool without exposed output has an empty preview, not a reconstructed result.

`stderr` contains bounded lines/fragments. `stopped` distinguishes completion-triggered termination, idle timeout, deadline, cancellation and oversized protocol output. Oversized output is reported with a bounded raw preview and the observed UTF-8 size before failure. Interactive TTY attachment has no structured stream.

API: [createObservationHub](../../reference/createobservationhub/) · [Observation](../../reference/observation/) · [ObservationSink](../../reference/observationsink/).
