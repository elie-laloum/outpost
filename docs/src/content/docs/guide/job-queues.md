---
title: "Job queues and workers"
description: "Execute registered handlers through a durable queue."
---

A queue moves JSON requests between producers and workers. Workers execute registered handlers; a request names a handler rather than supplying arbitrary executable code.

## Start a worker

Create `.outpost` first, then run the worker in its own process.

```ts
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
  await queue.close();
}
```

## Submit work

A producer opens the same queue and calls `enqueue({ id, handler: "count", input: [1, 2, 3] })`. Use stable IDs for deduplication and read retained job results through the queue contract. `defineQueuedTask()` wraps submission and polling as a workflow node and validates the returned value with `decode`. [Triggers](../webhooks/) publish jobs from cron schedules and verified webhooks, and `defineWorkflowJob()` runs a checkpointed workflow for each one.

```ts title="submit.mts"
import { createSqliteTaskQueue } from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
try {
  await queue.enqueue({ id: "count-42", handler: "count", input: [1, 2, 3] });
  console.log(await queue.get("count-42"));
} finally {
  await queue.close();
}
```

## Leases and retries

Workers claim fenced leases, renew them and report results. A stale lease cannot finalize a replacement owner’s job. Interrupted work can still repeat external side effects: handlers must be idempotent or deduplicate effects themselves.

A handler that fails on a usage or rate limit reports it in `QueueResult.quota`; with [quota pauses](../quota-pauses/#queued-tasks), the workflow pauses and later publishes a new job that keeps the original `idempotencyKey`.

Use `serveTaskQueue()` and `createHttpTaskQueue()` to expose a queue across processes over HTTP, with the configured token and a trusted transport boundary. Use [Redis workers](../redis-workers/) for the BullMQ backend. Cancellation and deadlines must be passed into handler operations.

API: [createSqliteTaskQueue](../../reference/createsqlitetaskqueue/) · [runQueueWorker](../../reference/runqueueworker/) · [defineQueuedTask](../../reference/definequeuedtask/) · [TaskQueue](../../reference/taskqueue/).

## Deduplicate effects

Available in 7.0.0: every `TaskContext` exposes `idempotencyKey`, derived from the workflow execution and task key. It remains stable across retries and checkpoint replay; a new execution gets a new key. Each remote `QueueHandlerContext` exposes the job ID as the same property. `defineQueuedTask()` preserves its existing job ID calculation. Direct producers must supply unique IDs for distinct logical operations and avoid collisions when sharing an effect service across queues.

Pass this key to the service performing the effect. For a database operation, store the receipt and business change in the same transaction with a unique constraint. For a remote API, use its persistent idempotency support. An in-memory set or a receipt written separately from the effect leaves a crash window.

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

`deliverOnce` must atomically deduplicate and retain its result for at least the replay period. If a handler performs several effects, derive separate keys for each operation. Fencing prevents stale queue writes; it does not stop an external service accepting a stale worker's request. Queue retention and effect receipts must cover your recovery window. Never delete receipts to force a retry without checking prior effects.

## Rotate HTTP credentials

Both queue HTTP endpoints accept fixed tokens as before. A server callback supplies accepted tokens for each request; a client callback supplies its current token, including heartbeats and completion calls.

```ts
import { serveTaskQueue, createHttpTaskQueue } from "@elie-laloum/outpost";
import type { TaskQueue } from "@elie-laloum/outpost";

async function connectRotatingQueue(
  queue: TaskQueue,
  acceptedTokens: () => Promise<readonly string[]>,
  currentToken: () => Promise<string>,
) {
  const server = await serveTaskQueue({ queue, token: acceptedTokens });
  const client = createHttpTaskQueue({ url: server.url, token: currentToken });
  return { server, client };
}
```

The caller closes `server` and the underlying queue separately. Publish both tokens on the server, update all clients, verify renewals with the new token, then remove the old one. A missing or failing server source denies access. Load credentials from your application's bounded secret cache; source callbacks must return promptly. Tokens grant all queue operations, not per-worker permissions. Use TLS termination and a private network boundary for remote traffic; never put tokens in URLs or logs. Revocation can abort a worker at its next heartbeat, so retain idempotency receipts before replacing it.

## Operate workers

Use a unique worker name per running process and deploy compatible handler versions before producers submit their jobs. Monitor queue age, failed jobs, lease-renewal errors and storage capacity. Synchronize approver clocks for proof expiry.

For planned shutdown, stop producers, let jobs settle, then abort the worker signal and await `runQueueWorker()` before closing its queue. Abort during a handler interrupts it cooperatively and leaves unfinished work reclaimable after lease expiry; handlers must propagate the signal. This API does not provide a separate drain command.

After a crash, first confirm the old process is stopped. Wait for the lease to expire, start a replacement and inspect the retained result and effect receipts. Recover an abandoned workflow checkpoint only through the explicit recovery procedure, then authorize `resume: "retry-incomplete"` where required. Do not infer that a remote process is stopped from its PID. See [durable runs](../durable-runs/) and [Redis workers](../redis-workers/) for backend-specific ownership and recovery.

## Run a workflow for each job

A trigger never runs a workflow inside the request or timer that fires it. It publishes a job to a [queue](../job-queues/), and a worker runs the workflow with a checkpoint. Every job carries a `runId` and a JSON `input`; `defineWorkflowJob()` turns them into a checkpointed run.

```ts
import {
  createLocalTransport,
  runQueueWorker,
  createSqliteTaskQueue,
  defineTask,
  defineWorkflow,
  createWorkflowCheckpointStore,
  defineWorkflowJob,
} from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runQueueWorker({
    queue,
    worker: "worker-1",
    signal: stop.signal,
    handlers: {
      fix: defineWorkflowJob({
        checkpoint: { store, version: "1" },
        workflow: (input, { runId }) =>
          defineWorkflow(runId, [
            defineTask({ key: "report", perform: () => ({ received: input }) }),
          ]),
      }),
    },
  });
} finally {
  queue.close();
}
```

Replace the task with your own graph, for example a `defineAgentTask` that fixes the issue named in `input`. The producers below publish to the same queue: a scheduler, a webhook server, or both.

### Run the workflow

`defineWorkflowJob({ workflow, checkpoint, start })` returns a queue handler. For each job it builds the workflow from `input`, then starts it with the job's `runId` as checkpoint run and the job's cancellation signal. The same input must build the same workflow.

- **Checkpoint version.** The run's version is `checkpoint.version` followed by a digest of the input. The same `runId` with a different input is rejected by the checkpoint identity check instead of mixing two requests in one run.
- **Result.** The job value reports `runId`, the effective checkpoint `version`, `executionId`, `status`, each task's status, pending gates (`pauses`) and `inputRequests`. Usage is the workflow's cumulative token usage.
- **Failures.** A `failed` or `cancelled` workflow completes the job with an error. A paused or waiting run completes the job normally with that status.
- **Concurrency.** A checkpoint has one owner at a time: a second job for a run that is still executing fails, and its delivery can be sent again later.
- **Gates.** To approve a paused run, submit the [decision](../approvals/#submit-a-decision) to the same workflow with `checkpoint: { store, runId, version }` from the job value.

`start` passes other workflow options, such as `concurrency`, `budget`, `onQuota` or `timeoutMs`. Replaying incomplete tasks still requires `checkpoint.resume: "retry-incomplete"`, as for any [durable run](../durable-runs/).
