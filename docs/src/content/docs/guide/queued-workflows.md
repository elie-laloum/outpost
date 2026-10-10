---
title: "Run workflows through a queue"
description: "Start with the producer and worker."
---

Start with the [producer and worker](../job-queues/). Use a queued task to wait for remote work, or a workflow job to preserve progress between worker processes.

## Wait for a job inside a workflow

`defineQueuedTask()` is a workflow task that enqueues a job, polls until it settles and validates its value with `decode`.

```ts
import * as outpost from "@elie-laloum/outpost";
const queue = await outpost.createSqliteTaskQueue(".outpost/jobs.sqlite");
const count = outpost.defineQueuedTask({
  key: "count",
  queue,
  handler: "count",
  input: () => [1, 2, 3],
  decode: (value) => {
    if (typeof value !== "number") throw new Error("Expected a count");
    return value;
  },
});
console.log(
  (await outpost.defineWorkflow("count-items", [count]).start()).value(count),
);
// Example output: 3
queue.close();
```

The job ID comes from the run's `executionId` and the task key, so a resumed [durable run](../durable-runs/) waits on the same job. Cancelling the workflow cancels the job. For a job stopped by a usage limit, see [Quota pauses](../quota-pauses/).

## Run a checkpointed workflow per job

`defineWorkflowJob()` turns a handler into one [durable run](../durable-runs/) per job. The job input is `{ runId, input }`, which is what [Cron schedules](../cron-schedules/) and [Webhooks](../webhooks/) publish.

```ts title="fix-job.ts"
import {
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineTask,
  defineWorkflow,
  defineWorkflowJob,
} from "@elie-laloum/outpost";

const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
export const fix = defineWorkflowJob({
  checkpoint: { store, version: "1" },
  workflow: (input) =>
    defineWorkflow("fix", [
      defineTask({ key: "report", perform: () => ({ received: input }) }),
    ]),
});
```

Run this worker with `node workflow-worker.ts`. It uses the producer’s queue.

```ts title="workflow-worker.ts"
import { createSqliteTaskQueue, runQueueWorker } from "@elie-laloum/outpost";
import { fix } from "./fix-job.ts";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runQueueWorker({
    queue,
    worker: "workflow-worker",
    signal: stop.signal,
    handlers: { fix },
  });
} finally {
  queue.close();
}
```

Register it in the worker with `handlers: { fix }`. For each job, `workflow` builds the graph from `input` and starts it under the job's `runId`; the same input must build the same graph. Pass other start options, such as `concurrency`, `budget`, `onQuota` or `timeoutMs`, in `start`.

The stored job result lets the producer inspect the completed workflow.

API reference: [QueueHandlerContext](../../reference/queuehandlercontext/).

`result.usage` holds the run's cumulative token usage. A `failed`, `cancelled` or `rejected` run fails the job; a paused or waiting run completes it. The summary in `result.value` retains the workflow status and its `terminationCode`: a gate refusal remains identifiable as `rejected` even though the job has status `failed`. See [termination codes](../../reference/workflowterminationcode/).

:::note
The digest ties a `runId` to one input. A job with the same `runId` and a different input fails the checkpoint identity check instead of mixing two requests in one run.
:::

### Resume a run

A completed job ID cannot run again: enqueuing it returns the stored job. To continue a run, enqueue a new job ID with the same `runId` and the same input.

```ts
import { createSqliteTaskQueue } from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const job = await queue.enqueue({
  id: "fix-42-resume-1",
  handler: "fix",
  input: { runId: "fix-42", input: { issue: 42 } },
});
console.log(job.status);
// Example output: pending
queue.close();
```

<!-- check:run -->

It prints `pending` until a worker runs the job. `done` tasks come from the checkpoint. Failed or interrupted tasks rerun only if the handler sets `checkpoint: { store, version: "1", resume: "retry-incomplete" }`: see [Durable runs](../durable-runs/).

### Approve or answer a paused run

`start` excludes `decisions` and `answers`: submit them from your application. Build the same workflow and call `workflow.start()` with `checkpoint: { store, runId, version }` from the job value, plus `decisions` ([approvals](../approvals/)) or `answers` ([interactive tasks](../interactive-tasks/)).

## Run independent jobs

This factory declares a separate ephemeral command for each task key.

```ts title="file-task.ts"
import { defineIsolatedCommandTask } from "@elie-laloum/outpost";
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";

export function fileTask(key: string) {
  return defineIsolatedCommandTask({
    key,
    request: () => ({
      workspaceSource: { kind: "ephemeral" },
      sandboxProvider: createLocalSandboxProvider(),
      command: { executable: "node", arguments: ["-p", "process.cwd()"] },
    }),
  });
}
```

Run both tasks together; their roots and sandboxes remain distinct.

```ts title="independent-files.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { fileTask } from "./file-task.ts";

const left = fileTask("left"),
  right = fileTask("right");
await defineWorkflow("independent-files", [left, right]).start({
  concurrency: 2,
});
```

The local provider here runs directly on the host without isolation. Each owned isolated task and queued job receives its own identity and root. Shared sandboxes remain sequential. Durable wrappers use a common workspace checkpoint coordinator. Borrowed workspaces remain the caller's responsibility and are not automatically made restorable. Task caches contain JSON results; hits do not reproduce file writes.
