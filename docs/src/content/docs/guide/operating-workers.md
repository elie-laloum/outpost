---
title: "Operate and recover workers"
description: "After your first job, prepare handlers for cancellation, crashes and repeated execution."
---

After your [first job](../job-queues/), prepare handlers for cancellation, crashes and repeated execution.

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

API reference: [QueueHandlerContext](../../reference/queuehandlercontext/) and [TaskContext](../../reference/taskcontext/).

A remote API with persistent idempotency keys works too. A receipt kept in memory, or written apart from the effect, is lost in a crash. Derive one key per effect when a handler makes several, and keep receipts as long as a job can be replayed.

## Operate workers

<!-- features -->

- **Deploy handlers first**: Start workers that know a handler before producers enqueue jobs for it.
- **Scale out**: Run more workers on the same queue, one `worker` name per process.
- **Stop cleanly**: Stop producers, abort the worker's signal, await `runQueueWorker()`, then close the queue.
- **Recover a crash**: Confirm the old process stopped, then start a replacement; it claims the job once the lease expires.
- **Recover a workflow job**: Release the crashed run's checkpoint as in [Durable runs](../durable-runs/), then enqueue a new job ID for a `retry-incomplete` handler.
- **Monitor**: Watch job age, failed jobs, lease renewal errors and storage space.

A handler aborted during a stop leaves its job `active`; another worker claims it once the lease expires. A reclaimed workflow job fails while the crashed run still owns its checkpoint.
