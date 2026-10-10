---
title: "Read execution state"
description: "Build an interface around a run ID, a persisted snapshot and a resumable event cursor."
---

Use this when a dashboard or another process must inspect a running workflow. Both processes need access to the same transport and execution ID. A heartbeat is an observation of activity; its expiry does not authorize restarting an owner.

## Record one execution

Create a receiver with an application-selected ID and attach it to a fresh observation hub. Pass that hub to one `dispatch()` or workflow `start()`. The receiver stores a snapshot and redacted observations in your [transport](../storage/), independently of the execution journal. Save the transport in `storage.ts` so another process can read the same location.

```ts title="storage.ts"
import { createLocalTransport } from "@elie-laloum/outpost";

export const transporter = createLocalTransport({
  directory: ".outpost/storage",
});
```

Save the receiver in `observation.ts`. Its caller owns disposal; the transport module can also be imported safely by independent readers.

```ts title="observation.ts"
import { createRunObserver, createObservationHub } from "@elie-laloum/outpost";
import { transporter } from "./storage.ts";

export const receiver = await createRunObserver({
  transporter,
  id: "nightly_2026_10_07",
  kind: "workflow",
});
export const observation = createObservationHub({ sinks: [receiver] });
```

Use `kind: "dispatch"` for a single request. Attach the receiver before starting. Its factory creates a running record even before the first event; the application chooses its ID, which is separate from the workflow's `executionId`. Duplicate IDs fail through a conditional transport write. Keep the receiver alive until the execution finishes, then close it to stop heartbeats. Closing an unfinished receiver leaves its record to expire.

For a readable summary of one finished dispatch, use its [run report](../run-reports/). This projection serves readers following an execution by ID.

## Start a workflow

A workflow records waiting tasks at startup, attempts, pauses, errors and cumulative consumption, including checkpointed usage on resume. Dispatches within its tasks retain their agent, current phase, branch, commits and consumption. Forward the workflow's observation scope when writing custom task dispatches; [isolated tasks](../multiple-repositories/) do this automatically.

```ts title="start.ts"
import { observation, receiver } from "./observation.ts";
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

await using ownedReceiver = receiver;
const check = defineTask({ key: "check", perform: () => "ok" });
const workflow = defineWorkflow("nightly", [check]);
const result = await workflow.start({ observation });
await observation.close();
result.unwrap();
```

Save these files together and run `node start.ts`. The observation hub flushes delivery when the workflow settles. Failures in receivers appear in `observerErrors` and do not change the execution outcome. Inspect those errors and `receiver.errors`; heartbeat failures stop the receiver. [Redaction](../observability/) applies before persistence when configured on the hub or execution.

## Read from another process

Give the reader the same transport location and ID. It reads a single atomically replaced snapshot without acquiring an execution lock. A missing ID returns `undefined`. With S3, instantiate the same bucket/prefix configuration in the reader; no host filesystem or PID lookup is required.

```ts title="snapshot.ts"
import { transporter } from "./storage.ts";
import { readRun } from "@elie-laloum/outpost";

export const run = await readRun({ transporter, id: "nightly_2026_10_07" });
if (run) {
  console.log(
    run.status,
    run.tasks.map((t) => `${t.key}: ${t.status}`),
  );
  console.log(run.dispatches, run.commits, run.usage, run.errors);
}
```

Run `node snapshot.ts` in a second process to read the saved status. If prices are configured, `accounting.cost` contains the monetary estimate.

`complete: false` signals a detected event gap or expired running record. `complete: true` means no gap was detected, but final events may still be lost. This view is independent of the checkpoint and never authorizes replay, integration or resource recovery.

Tasks restored without previous observation history expose `usage.complete: false`; the workflow's cumulative total still comes from its checkpoint accounting.

## Follow a cursor

First render the snapshot, then follow observations strictly after its `seq`. Events are written before the snapshot publishes their cursor, so a reader never follows an unpublished event. The persistent sequence continues across settled workflow resumes; it is distinct from each hub's `observationSeq`. The event payload is `unknown`, so an interface must validate it before inspecting fields.

```ts title="watch.ts"
import { transporter } from "./storage.ts";
import { run } from "./snapshot.ts";
import { watchRun } from "@elie-laloum/outpost";

if (run) {
  for await (const event of watchRun({
    transporter,
    id: run.id,
    from: run.seq,
  })) {
    console.log(event.seq, event.scope.taskKey, event.event);
  }
}
```

Run `node watch.ts` to read the snapshot and subsequent events. The reader polls storage until it has delivered the events of a settled or abandoned run. Save the last processed cursor to reconnect; heartbeat updates use no cursor. Cancel the reader with `signal` without stopping the run.

Refresh your interface by reading the snapshot again. Missing segments, invalid records and cursors ahead of the snapshot fail explicitly. [Read limits](../../reference/watchrunoptions/) default to 8 MiB per object and can be lowered.

## Interpret heartbeats and resumes

The receiver refreshes its heartbeat every five seconds by default. A running snapshot becomes `abandoned` on read after thirty seconds without an update. Readers never persist that status or change ownership. Slow storage, a network outage or a blocked event loop can also expire a heartbeat; this indicates suspected abandonment, not proof that a process stopped. Paused, waiting-input and finished workflows do not require heartbeats.

When explicitly resuming a settled workflow checkpoint, create a new receiver with the same ID, `kind: "workflow"` and `resume: true`, and attach a fresh hub. It preserves task consumption, dispatch history and cursors. The checkpoint's execution identity must match. Concurrent writers are fenced by revisions. An unsettled projection, even with an expired heartbeat, cannot be taken over: recover the execution explicitly and observe the recovered run under a new ID.

Run records live under `runs/<id>/` and remain protected by retention planning. Event storage grows with the run; the receiver stops and reports an error when a snapshot or event exceeds 8 MiB. Keep model/raw payload verbosity appropriate for your interface. Deterministic tests cover local storage and an HTTP S3 fixture; live AWS validation remains pending.

The runnable [example 57](https://gitlab.elielaloum.com/elielaloum/outpost/-/tree/main/examples/57-run-state) includes a separate reader process. API: [createRunObserver](../../reference/createrunobserver/) · [readRun](../../reference/readrun/) · [watchRun](../../reference/watchrun/) · [RunSnapshot](../../reference/runsnapshot/).
