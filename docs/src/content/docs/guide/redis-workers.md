---
title: "Use Redis and BullMQ"
description: "Configure a shared Redis queue for producers and workers on separate processes or machines."
---

## Prerequisites

<!-- features -->

- `bullmq`: An optional package, installed next to Outpost.
- **A standalone Redis server**: Self-hosted or managed, reachable by every producer and worker.
- **The `noeviction` policy**: Required by the queue, which checks it at open.

Install BullMQ alongside Outpost to connect producers and workers to the Redis queue.

```sh
npm install bullmq
```

Use a dedicated Redis queue for all producers and workers that share these jobs. Configure its eviction policy before connecting BullMQ, so Redis does not discard queue keys under memory pressure.

Enable Redis persistence (AOF or RDB snapshots) if jobs must survive a Redis restart.

## Set the eviction policy

On your own server, set the policy and keep it across restarts:

```sh
redis-cli CONFIG SET maxmemory-policy noeviction
redis-cli CONFIG REWRITE
```

On a managed service, change it in the console: on Redis Cloud, set the database **Data eviction policy** to **No eviction**; on Amazon ElastiCache, attach a custom parameter group with `maxmemory-policy` set to `noeviction`. Then check what Redis reports:

```sh
redis-cli INFO memory | grep maxmemory_policy
# maxmemory_policy:noeviction
```

`createBullMQTaskQueue()` reads the same `INFO` line and rejects any other policy, or a server that hides it. It never changes the server configuration.

:::caution
Other policies can evict the expiring keys that hold worker leases. With `noeviction`, Redis rejects writes when its memory is full: monitor memory and handle failed `enqueue()` calls.
:::

## Configure the queue

Import the adapter from its own subpath. The queue implements the same contract as the SQLite queue, so a worker runs on it unchanged ([Job queues and workers](../job-queues/)).

```ts title="worker.ts"
import { runQueueWorker } from "@elie-laloum/outpost";
import { createBullMQTaskQueue } from "@elie-laloum/outpost/queues/bullmq";

const queue = await createBullMQTaskQueue({
  name: "code-reviews",
  connection: { host: "127.0.0.1", port: 6379 },
});
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runQueueWorker({
    queue,
    worker: `reviewer-${process.pid}`,
    signal: stop.signal,
    handlers: { review: (input) => ({ value: input }) },
  });
} finally {
  await queue.close();
}
```

A producer opens the same queue and enqueues a job for the `review` handler:

```ts title="submit.ts"
import { createBullMQTaskQueue } from "@elie-laloum/outpost/queues/bullmq";

const queue = await createBullMQTaskQueue({
  name: "code-reviews",
  connection: { host: "127.0.0.1", port: 6379 },
});
try {
  await queue.enqueue({
    id: "review-42",
    handler: "review",
    input: { commit: "abc123" },
  });
} finally {
  await queue.close();
}
```

API reference: [BullMQTaskQueueOptions](../../reference/bullmqtaskqueueoptions/).

## Connect producers and workers

Every producer and worker must use the same `name`, `prefix`, Redis database and server. A difference in any of them silently gives it a separate, empty queue.

```ts
import { createBullMQTaskQueue } from "@elie-laloum/outpost/queues/bullmq";

const queue = await createBullMQTaskQueue({
  name: "code-reviews",
  prefix: "outpost",
  connection: {
    host: process.env.REDIS_HOST,
    port: 6379,
    db: 0,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    tls: {},
  },
});
await queue.close();
```

Pass connection settings, not a Redis client. Use `prefix` rather than `connection.keyPrefix`, which the adapter rejects. Keep the prefix for Outpost alone: no other BullMQ consumer or cleanup job should touch its keys.

## What the adapter owns

<!-- features -->

- **Connections**: One to open the queue, then a BullMQ queue and worker for each handler, opened on first use.
- **Lease checks**: A timer that returns jobs with expired leases to the queue.
- **Closing**: `close()` rejects new calls, waits for calls in progress, then closes every connection.

Jobs, leases and results stay in Redis after `close()`, for the next process. Stop the worker before closing: abort its signal and await `runQueueWorker()`, as in `worker.ts`.

## Interrupted completion

The queue records each result in its own Redis state first, then marks the BullMQ job done. That recorded result is authoritative:

<!-- features -->

- **Finalization fails**: `complete()` still succeeds, `get()` returns the result, and the job never runs again. The error goes to `onError`.
- **Enqueue fails midway**: Send the same request with the same `id` again; the queue accepts it and publishes it.
- **A worker crashes**: Its lease expires and another worker claims the job with the same `idempotencyKey`.

## Rotate Redis credentials

Connection settings are read once, when the queue opens. Rotate them by replacing processes:

1. Create a second Redis ACL user with the same permissions.
2. Start producers and workers with the new credentials and the same queue `name` and `prefix`.
3. Stop old workers: abort their signal, await `runQueueWorker()`, then close their queue connections.
4. Delete the old ACL user and disconnect its remaining clients.

A credential revoked while a worker still runs makes it lose its lease. Another worker then runs the job again with the same `idempotencyKey`: your effect service must deduplicate ([Job queues and workers](../job-queues/)).

## Limits

- **Standalone Redis only**: Redis Cluster is not supported. Behavior across a Sentinel or managed primary failover is not guaranteed; test it before relying on it.
- **At-least-once effects**: Leases stop stale workers from writing results, not from repeating external side effects. Deduplicate with `idempotencyKey`.
- **Durability is Redis durability**: Without persistence, a Redis restart loses the queue.

API: [createBullMQTaskQueue](../../reference/createbullmqtaskqueue/) · [BullMQTaskQueueOptions](../../reference/bullmqtaskqueueoptions/) · [runQueueWorker](../../reference/runqueueworker/).
