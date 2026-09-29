---
title: "Job queues and workers"
description: "Hand work to long-running worker processes through a durable queue, run a checkpointed workflow per job and keep external effects deduplicated."
---

## How a job runs

A job names a registered handler and carries JSON input. Workers run only the handlers you registered, never code sent with the job.

<!-- flow -->

1. **Submit**: A producer adds the job.
   - **Enqueue**: The job is stored as `pending` under its ID.
     - `enqueue()`
2. **Claim**: A worker takes it.
   - **Lease**: The worker claims a job for one of its handlers and renews a lease while it runs.
     - `runQueueWorker()`
3. **Run**: The handler does the work.
   - **Handle**: It receives the input, a cancellation signal and an `idempotencyKey`.
     - `QueueHandler`
4. **Store**: The result stays in the queue.
   - **Complete**: The job becomes `done`, or `failed` with an error.
   - **Read**: Producers read it back by ID.
     - `get()`

## Start a worker

Run the worker in its own process. It polls the queue and runs one job at a time until its signal aborts.

```ts title="worker.mts"
import { createSqliteTaskQueue, runQueueWorker } from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runQueueWorker({
    queue,
    worker: "worker-1",
    signal: stop.signal,
    handlers: {
      count: (input) => ({ value: Array.isArray(input) ? input.length : 0 }),
    },
  });
} finally {
  queue.close();
}
```

`createSqliteTaskQueue()` creates the file and its parent directory. A handler returns `{ value }`, with optional `usage` and `error`; a thrown error or an `error` field marks the job `failed`. For parallel work, run several workers, each with its own `worker` name.

## Submit work

A producer opens the same queue and enqueues a job under a stable ID.

```ts title="submit.mts"
import { createSqliteTaskQueue } from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
try {
  await queue.enqueue({ id: "count-42", handler: "count", input: [1, 2, 3] });
  console.log(await queue.get("count-42"));
} finally {
  queue.close();
}
```

<!-- check:run -->

It prints the job with `status: "pending"`; once a worker has run it, `result.value` holds `3`. Enqueuing an existing ID with the same request returns the existing job; a different request under that ID is rejected. `cancel(id, job.fence)` cancels a pending or running job.

### Wait for a job inside a workflow

`defineQueuedTask()` is a workflow task that enqueues a job, polls until it settles and validates its value with `decode`.

```ts
import {
  createSqliteTaskQueue,
  defineQueuedTask,
  defineWorkflow,
} from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const count = defineQueuedTask({
  key: "count",
  queue,
  handler: "count",
  input: () => [1, 2, 3],
  decode: (value) => {
    if (typeof value !== "number") throw new Error("Expected a count");
    return value;
  },
});
const result = await defineWorkflow("count-items", [count]).start();
console.log(result.value(count));
queue.close();
```

The job ID comes from the run's `executionId` and the task key, so a resumed [durable run](../durable-runs/) waits on the same job. Cancelling the workflow cancels the job. For a job stopped by a usage limit, see [Quota pauses](../quota-pauses/).

## Run a checkpointed workflow per job

`defineWorkflowJob()` turns a handler into one [durable run](../durable-runs/) per job. The job input is `{ runId, input }`, which is what [Cron schedules](../cron-schedules/) and [Webhooks](../webhooks/) publish.

```ts title="fix-job.mts"
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

Register it in the worker with `handlers: { fix }`. For each job, `workflow` builds the graph from `input` and starts it under the job's `runId`; the same input must build the same graph. Pass other start options, such as `concurrency`, `budget`, `onQuota` or `timeoutMs`, in `start`.

The job's `result.value` summarises the run:

| Field           | Content                                                            |
| --------------- | ------------------------------------------------------------------ |
| `runId`         | The checkpoint run.                                                |
| `version`       | `checkpoint.version` plus an input digest: `1#input:<digest>`.     |
| `executionId`   | The run's execution, needed to submit decisions and answers.       |
| `status`        | `done`, `paused`, `waiting-input`, `failed` or `cancelled`.        |
| `tasks`         | Each task's `key` and `status`.                                    |
| `pauses`        | Pending gates: `key`, `id`, `kind`, `prompt`, `actors`.            |
| `inputRequests` | Pending questions from [interactive tasks](../interactive-tasks/). |

`result.usage` holds the run's cumulative token usage. A `failed` or `cancelled` run fails the job; a paused or waiting run completes it.

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
queue.close();
```

<!-- check:run -->

It prints `pending` until a worker runs the job. `done` tasks come from the checkpoint. Failed or interrupted tasks rerun only if the handler sets `checkpoint: { store, version: "1", resume: "retry-incomplete" }`: see [Durable runs](../durable-runs/).

### Approve or answer a paused run

`start` excludes `decisions` and `answers`: submit them from your application. Build the same workflow and call `workflow.start()` with `checkpoint: { store, runId, version }` from the job value, plus `decisions` ([approvals](../approvals/)) or `answers` ([interactive tasks](../interactive-tasks/)).

## Leases and retries

Each claim increments the job's `fence`, so a worker that lost its lease cannot overwrite its successor's result.

| Event                          | What happens                                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| Handler runs                   | The lease lasts `leaseMs` (default 30 s, from 30 ms to 5 min) and is renewed every third of it. |
| Worker crashes                 | The lease expires; another worker claims the job with a new fence.                              |
| Renewal fails or job cancelled | The handler's `signal` aborts and this worker stores no result.                                 |
| Handler fails                  | The job becomes `failed`. The queue does not retry it: enqueue a new ID.                        |
| `deadline` passes              | The job becomes `cancelled`. `deadline` is a timestamp in epoch milliseconds.                   |

Pass `signal` to every operation the handler starts, so cancellation and lost leases stop it.

## Deduplicate effects with idempotency keys

A job can run twice: a crashed worker's successor starts the handler again. Handlers with external effects deduplicate them with `idempotencyKey`.

```ts
import type { QueueHandler, WorkflowJson } from "@elie-laloum/outpost";

function deliveryHandler(
  deliverOnce: (
    key: string,
    input: WorkflowJson,
    signal: AbortSignal,
  ) => Promise<WorkflowJson>,
): QueueHandler {
  return async (input, { idempotencyKey, signal }) => ({
    value: await deliverOnce(idempotencyKey, input, signal),
  });
}
```

<!-- features -->

- `QueueHandlerContext.idempotencyKey`: The job ID, or the original key when a quota pause republished the job.
- `TaskContext.idempotencyKey`: Derived from the run and the task key, stable across retries and checkpoint replay.
- **Receipt**: Store it with the effect, in the same transaction, under a unique constraint.

A remote API with persistent idempotency keys works too. A receipt kept in memory, or written apart from the effect, is lost in a crash. Derive one key per effect when a handler makes several, and keep receipts as long as a job can be replayed.

## Expose a queue over HTTP

`serveTaskQueue()` puts any queue behind an HTTP endpoint. `createHttpTaskQueue()` is a queue client for producers and workers on other machines.

```ts title="queue-server.mts"
import { createSqliteTaskQueue, serveTaskQueue } from "@elie-laloum/outpost";

const token = process.env.OUTPOST_QUEUE_TOKEN;
if (!token) throw new Error("Set OUTPOST_QUEUE_TOKEN");

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const server = await serveTaskQueue({ queue, token, port: 8788 });
console.log(`Queue at ${server.url}`);
```

On another machine, `createHttpTaskQueue({ url, token })` returns a queue for `runQueueWorker()` or `enqueue()`. The token is 32 to 512 characters without spaces. The server listens on `127.0.0.1` unless you set `host`; `await server.close()` stops it, and you close the underlying queue yourself.

To rotate tokens, give `token` a function, read on every request. The server's returns the accepted tokens; an empty list or an error rejects every request.

<!-- flow -->

1. **Add**: The server accepts both tokens.
   - **Server**: Its function returns the old and the new token.
2. **Switch**: Clients move to the new token.
   - **Clients**: Their function returns the new token, for heartbeats and completions too.
3. **Remove**: The server drops the old token.
   - **Server**: Its function returns only the new token.

## Operate workers

<!-- features -->

- **Deploy handlers first**: Start workers that know a handler before producers enqueue jobs for it.
- **Scale out**: Run more workers on the same queue, one `worker` name per process.
- **Stop cleanly**: Stop producers, abort the worker's signal, await `runQueueWorker()`, then close the queue.
- **Recover a crash**: Confirm the old process stopped, then start a replacement; it claims the job once the lease expires.
- **Recover a workflow job**: Release the crashed run's checkpoint as in [Durable runs](../durable-runs/), then enqueue a new job ID for a `retry-incomplete` handler.
- **Monitor**: Watch job age, failed jobs, lease renewal errors and storage space.

A handler aborted during a stop leaves its job `active`; another worker claims it once the lease expires. A reclaimed workflow job fails while the crashed run still owns its checkpoint.

## Choose a backend

| Backend      | Create                                                              | Use it for                                     | Close                 |
| ------------ | ------------------------------------------------------------------- | ---------------------------------------------- | --------------------- |
| SQLite       | `createSqliteTaskQueue(path)`                                       | Processes on one machine sharing a file.       | `queue.close()`       |
| HTTP         | `createHttpTaskQueue({ url, token })`                               | Clients of a queue served by `serveTaskQueue`. | Nothing to close      |
| Redis/BullMQ | `createBullMQTaskQueue()` from `@elie-laloum/outpost/queues/bullmq` | Workers spread across machines.                | `await queue.close()` |

The BullMQ backend has its own setup: see [Redis and BullMQ](../redis-workers/).

## Limits

- Inputs and values are JSON, up to 256 KiB each. IDs and handler names are at most 512 characters, a `runId` at most 256.
- A worker registers at most 100 handlers.
- A failed job keeps its result. A retried or resumed `defineQueuedTask()` finds the same failed job, so retry inside the handler.
- One job at a time per `runId`: a second job for a run still in progress fails.
- The queue fences stale writes but does not make external effects exactly-once.
- An HTTP token grants every queue operation. Serve it behind TLS on a private network, and keep tokens out of URLs and logs.

API: [runQueueWorker](../../reference/runqueueworker/) · [createSqliteTaskQueue](../../reference/createsqlitetaskqueue/) · [TaskQueue](../../reference/taskqueue/) · [QueueHandler](../../reference/queuehandler/) · [QueueHandlerContext](../../reference/queuehandlercontext/) · [defineQueuedTask](../../reference/definequeuedtask/) · [defineWorkflowJob](../../reference/defineworkflowjob/) · [serveTaskQueue](../../reference/servetaskqueue/) · [createHttpTaskQueue](../../reference/createhttptaskqueue/).
