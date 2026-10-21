---
title: "Read execution state"
description: "Record an execution automatically and inspect it through observation.readRun() and observation.watchRun()."
---

Use `createObservation({ transporter })` when a terminal, dashboard or another process must inspect an execution. Pass the object to `dispatch()` or `workflow.start()`. The engine records that execution and closes its tracking session when it settles. The observation object can serve successive or concurrent executions.

## Record one execution

Save the following files together. The shared transport gives the runner and reader access to the same storage. Creating the observation object only configures it: no run record or heartbeat starts until an execution uses it.

```ts title="storage.ts"
import { createLocalTransport } from "@elie-laloum/outpost";

export const transporter = createLocalTransport({
  directory: ".outpost/storage",
});
```

Create the observation object with the transport and any additional sinks. It borrows those sinks and the transport; their owner remains responsible for closing them when necessary.

```ts title="observation.ts"
import { createObservation } from "@elie-laloum/outpost";
import { transporter } from "./storage.ts";

export const observation = createObservation({ transporter });
```

## Start a workflow

Save this as `start.ts` and run `node start.ts`. The workflow chooses the execution kind and owns the tracking session. Specify `runId` when another process needs to know the ID in advance. Otherwise the checkpoint’s run ID is used, or a new ID is generated and returned as `result.observationId`.

```ts title="start.ts"
import { observation } from "./observation.ts";
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

await using ownedObservation = observation;
const check = defineTask({ key: "check", perform: () => "ok" });
const result = await defineWorkflow("nightly", [check]).start({
  observation,
  runId: "nightly_2026_10_21",
});
console.log(result.observationId, result.status);
result.unwrap();
```

Use `result.observationId` with the observation client; the existing result `runId` remains equal to it for compatibility. The input option is still named `runId`. A workflow’s `executionId` identifies its execution history, while `checkpoint.runId` selects its durable checkpoint. Choosing a different observation ID does not replay completed tasks or change checkpoint ownership. Without an automatic tracking session, `observationId` is absent.

`dispatch({ observation, runId, ... })` uses the same API for a single request. A nested dispatch receiving `context.observation` joins its workflow’s projection. Forward that scope in custom tasks; isolated tasks do it automatically. A standalone dispatch continuation is a new execution and needs a fresh ID.

With a transport, duplicate IDs refuse creation before execution work begins. Storage failure while opening tracking also rejects startup. Once tracking is open, receiver failures appear in `observerErrors` and `observation.errors` and do not change the work’s outcome. The engine flushes its session and stops its heartbeat before returning. Closing the shared observation waits for active sessions without cancelling them; keep it open until all intended executions have started.

## Record a dispatch

With the [agent configuration](../setup/), save this additional file and run `node dispatch.ts`. The dispatch owns tracking and returns after its session closes. Use a fresh ID for another independent execution.

```ts title="dispatch.ts"
import { dispatch } from "@elie-laloum/outpost";
import { observation } from "./observation.ts";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await using ownedObservation = observation;
const result = await dispatch({
  runId: "review-123",
  observation,
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/review-123" },
  brief: { text: "Review the code without modifying files." },
});
console.log(result.observationId, result.text);
```

## Read from another process

Run this file after the execution has been registered. A missing ID returns `undefined`; readers neither create a record nor acquire execution ownership. With S3, use the same bucket and prefix in each process. Configure [redaction](../redacting-secrets/) on the producing observation or execution before anything is stored.

```ts title="snapshot.ts"
import { createObservation } from "@elie-laloum/outpost";
import { transporter } from "./storage.ts";

await using reader = createObservation({ transporter });
export const run = await reader.readRun("nightly_2026_10_21");
if (run) {
  console.log(run.status, run.tasks, run.dispatches, run.usage);
}
```

`complete: false` indicates a detected event gap or expired running record. `complete: true` means no gap was detected; final events can still be lost. This projection is separate from checkpoints, accounting and execution journals. It never authorizes replay, integration or recovery. A finished dispatch’s [run report](../run-reports/) provides its review summary.

## Follow a cursor

Read a snapshot, then follow observations after its `seq`. Save the last processed cursor to reconnect. Run this file after registration; it prints stored events followed by new ones until the execution settles or its heartbeat expires. The event payload is `unknown`, so validate it before reading its fields.

```ts title="watch.ts"
import { createObservation } from "@elie-laloum/outpost";
import { transporter } from "./storage.ts";

await using reader = createObservation({ transporter });
const run = await reader.readRun("nightly_2026_10_21");
const controller = new AbortController();
if (run) {
  for await (const event of reader.watchRun(run.id, {
    from: run.seq,
    signal: controller.signal,
  })) {
    console.log(event.seq, event.scope.taskKey, event.event);
  }
}
```

Aborting the reader’s signal stops only the subscription. It never cancels the execution. Refresh the snapshot with `readRun()` when needed. Missing segments, malformed records and cursors ahead of the snapshot fail explicitly. Reads default to 8 MiB per object and can be bounded further through [ObservationReadOptions](../../reference/observationreadoptions/) and [ObservationWatchOptions](../../reference/observationwatchoptions/).

## Interpret heartbeats and resumes

The default heartbeat is five seconds, with suspected abandonment after thirty seconds. A slow transport or blocked event loop can also expire it. Reading an expired record reports `abandoned` without changing storage or granting recovery authorization. Settled workflows need no heartbeat.

When a workflow opens an existing checkpoint, observation resumes the settled projection under the selected run ID, preserving its persistent cursor and execution identity. A previously unobserved checkpoint can start a new projection. An unsettled projection cannot be taken over, even after heartbeat expiry: explicitly recover the execution and choose a new observation `runId`. A resumed watcher starts a new subscription, since subscriptions finish at each settled state.

Run records live under `runs/<id>/` and remain protected by retention planning. Event storage grows with the run. An event or snapshot over 8 MiB stops the receiver and reports an observation error. Deterministic tests cover local storage; existing low-level run tests also use an HTTP S3 fixture. Live AWS validation remains separate.

`createObservationHub()`, `createRunObserver()`, standalone `readRun()`/`watchRun()` and historical callbacks remain available for specialized composition. They retain their explicit ownership contracts; the unified client does not close borrowed receivers for you.

The runnable [example 57](https://gitlab.elielaloum.com/elielaloum/outpost/-/tree/main/examples/57-run-state) includes a separate reader process. API: [createObservation](../../reference/createobservation/) · [ObservationClient](../../reference/observationclient/) · [ObservationOptions](../../reference/observationoptions/) · [RunSnapshot](../../reference/runsnapshot/).
