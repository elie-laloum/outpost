---
title: "Run jobs with workers"
description: "Submit jobs to a queue and run them in workers with leases, retries and saved results."
---

The first producer and worker run without an agent or account. Save `worker.ts` and `submit.ts` together, start `node worker.ts` in one terminal, then `node submit.ts` in another using the same working directory. Inspect the stored job after the worker finishes.

## How a job runs

Producers publish a handler name and JSON input to a queue. Workers claim jobs, call the registered handler and store its result. Choose a queue shared by every producer and worker that needs to participate.

<!-- canvas -->

- **Submit**: The producer saves a job in the shared queue.
  - Producer
  - → **Execute**: job claimed
- **Execute**: The worker runs the registered handler while renewing its lease.
  - Worker
  - → **Read**: result saved
- **Read**: The producer looks up the job ID to read its result or error.
  - Producer

## Start a worker

Run the worker in its own process. It polls the queue and runs one job at a time until its signal aborts.

```ts title="worker.ts"
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

```ts title="submit.ts"
import { createSqliteTaskQueue } from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
try {
  await queue.enqueue({ id: "count-42", handler: "count", input: [1, 2, 3] });
  console.log(await queue.get("count-42"));
  // Example output: { id: "count-42", status: "pending", … }
} finally {
  queue.close();
}
```

<!-- check:run -->

The immediate read can show `pending`, `running` or a finished job. Once the worker has run it, `result.value` holds `3`. Enqueuing an existing ID with the same request returns the existing job; a different request under that ID is rejected. `cancel(id, job.fence)` cancels a pending or running job.

### Read the result

After processing, run `node read-job.ts`. If the status stays `pending`, check that the worker uses the same database and registers `count`. A completed job prints the value `3`.

```ts title="read-job.ts"
import { createSqliteTaskQueue } from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
try {
  const job = await queue.get("count-42");
  console.log(job?.status, job?.result);
} finally {
  queue.close();
}
```

## Choose a backend

| Backend      | Create                                                              | Use it for                                     | Close                 |
| ------------ | ------------------------------------------------------------------- | ---------------------------------------------- | --------------------- |
| SQLite       | `createSqliteTaskQueue(path)`                                       | Processes on one machine sharing a file.       | `queue.close()`       |
| HTTP         | `createHttpTaskQueue({ url, token })`                               | Clients of a queue served by `serveTaskQueue`. | Nothing to close      |
| Redis/BullMQ | `createBullMQTaskQueue()` from `@elie-laloum/outpost/queues/bullmq` | Workers spread across machines.                | `await queue.close()` |

The BullMQ backend has its own setup: see [Redis and BullMQ](../redis-workers/).

## File workspaces

Workers also execute configuration-3 file recipes through the same recipe runtime. Each owned job gets a distinct materialization; shared publication destinations still coordinate through host-wide locks. See [independent file jobs](../queued-workflows/#run-independent-jobs).

## Limits

- Inputs and values are JSON, up to 256 KiB each. IDs and handler names are at most 512 characters, a `runId` at most 256.
- A worker registers at most 100 handlers.
- A failed job keeps its result. A retried or resumed `defineQueuedTask()` finds the same failed job, so retry inside the handler.
- One job at a time per `runId`: a second job for a run still in progress fails.
- The queue fences stale writes but does not make external effects exactly-once.
- An HTTP token grants every queue operation. Serve it behind TLS on a private network, and keep tokens out of URLs and logs.

API: [runQueueWorker](../../reference/runqueueworker/) · [createSqliteTaskQueue](../../reference/createsqlitetaskqueue/) · [TaskQueue](../../reference/taskqueue/) · [QueueHandler](../../reference/queuehandler/) · [QueueHandlerContext](../../reference/queuehandlercontext/) · [defineQueuedTask](../../reference/definequeuedtask/) · [defineWorkflowJob](../../reference/defineworkflowjob/) · [serveTaskQueue](../../reference/servetaskqueue/) · [createHttpTaskQueue](../../reference/createhttptaskqueue/).

## Next steps

- [Share the queue over HTTP](../http-queues/)

<!-- Retained section anchors for existing bookmarks. -->

<span id="expose-a-queue-over-http"></span>

## Continue

- [Save workflow progress](../queued-workflows/)
- [Operate workers](../operating-workers/)

<span id="wait-for-a-job-inside-a-workflow"></span>
<span id="run-a-checkpointed-workflow-per-job"></span>
<span id="resume-a-run"></span>
<span id="approve-or-answer-a-paused-run"></span>

<span id="leases-and-retries"></span>
<span id="deduplicate-effects-with-idempotency-keys"></span>
<span id="operate-workers"></span>
