---
title: "Background jobs"
description: "Execute registered handlers through a durable queue."
---

A queue moves JSON requests between producers and workers. Workers execute registered handlers; a request names a handler rather than supplying arbitrary executable code.

## Start a worker

Create `.outpost` first, then run the worker in its own process.

```ts
import { sqliteTaskQueue, runQueueWorker } from "@elie-laloum/outpost";

const queue = await sqliteTaskQueue(".outpost/jobs.sqlite");
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

A producer opens the same queue and calls `enqueue({ id, handler: "count", input: [1, 2, 3] })`. Use stable IDs for deduplication and read retained job results through the queue contract. `queuedTask()` wraps submission and polling as a workflow node and validates the returned value with `decode`.

```ts title="submit.mts"
import { sqliteTaskQueue } from "@elie-laloum/outpost";

const queue = await sqliteTaskQueue(".outpost/jobs.sqlite");
try {
  await queue.enqueue({ id: "count-42", handler: "count", input: [1, 2, 3] });
  console.log(await queue.get("count-42"));
} finally {
  await queue.close();
}
```

## Leases and retries

Workers claim fenced leases, renew them and report results. A stale lease cannot finalize a replacement owner’s job. Interrupted work can still repeat external side effects: handlers must be idempotent or deduplicate effects themselves.

Use `serveTaskQueue()` and `httpTaskQueue()` to expose a queue across processes over HTTP, with the configured token and a trusted transport boundary. Use [Redis workers](../redis-workers/) for the BullMQ backend. Cancellation and deadlines must be passed into handler operations.

API: [sqliteTaskQueue](../../reference/sqlitetaskqueue/) · [runQueueWorker](../../reference/runqueueworker/) · [queuedTask](../../reference/queuedtask/) · [TaskQueue](../../reference/taskqueue/).
