---
title: "Distributed execution — Overview"
description: "Hand jobs to worker processes through a durable queue, with fenced leases, idempotency keys and typed workflow tasks."
sidebar:
  label: Overview
  order: 0
---

## Choose a backend

Every backend implements `TaskQueue`, so `runQueueWorker()`, `defineQueuedTask()` and [defineWorkflowJob()](../../defineworkflowjob/) work unchanged on each.

| Backend      | Create                                                                                  | Use it for                                                                            | Close                                        |
| ------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------- |
| SQLite       | `createSqliteTaskQueue(path)`                                                           | Producers and workers on one machine sharing a database file                          | `queue.close()`                              |
| HTTP         | `serveTaskQueue({ queue, token })`, then `createHttpTaskQueue({ url, token })`          | Clients on other machines; bearer tokens can rotate, read on every request            | `await server.close()`, then the queue       |
| BullMQ/Redis | `createBullMQTaskQueue({ name, connection })` from `@elie-laloum/outpost/queues/bullmq` | Workers across machines sharing a standalone Redis with `maxmemory-policy noeviction` | `await queue.close()` after the workers stop |

:::caution
The HTTP server has no TLS and a token grants every queue operation. Serve it behind TLS on a private network.
:::

## How a job runs

Each claim increments the job’s `fence`; `renew()` and `complete()` succeed only with the current fence and an unexpired lease.

| Event                                    | Job                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------ |
| `enqueue()` with a new ID                | `pending`, fence 0                                                                   |
| `enqueue()` with an existing ID          | Same request: the stored job, in any status; different request: rejected             |
| A worker claims it                       | `active`, fence + 1, lease of `leaseMs` (default 30000), renewed at each third of it |
| The lease expires (crashed worker)       | Another worker claims it with fence + 1; the old worker’s writes are rejected        |
| The handler returns without `error`      | `done`                                                                               |
| The handler throws or returns `error`    | `failed`; the queue never retries it                                                 |
| `cancel(id, fence)` or `deadline` passes | `cancelled`, fence + 1; the running handler’s signal aborts at its next renewal      |

:::caution
Fencing rejects stale writes, not repeated effects: a reclaimed job runs its handler again. Deduplicate external effects with `QueueHandlerContext.idempotencyKey`.
:::

## Entry points

Guide: [Job queues and workers](../../../guide/job-queues/) · [Redis and BullMQ](../../../guide/redis-workers/)

- [createSqliteTaskQueue](../../createsqlitetaskqueue/)
- [createBullMQTaskQueue](../../createbullmqtaskqueue/)
- [serveTaskQueue](../../servetaskqueue/)
- [createHttpTaskQueue](../../createhttptaskqueue/)
- [runQueueWorker](../../runqueueworker/)
- [defineQueuedTask](../../definequeuedtask/)
- [TaskQueue](../../taskqueue/)
- [QueueJob](../../queuejob/)
- [QueueHandlerContext](../../queuehandlercontext/)
- [QueueWorkerOptions](../../queueworkeroptions/)
- [BullMQTaskQueueOptions](../../bullmqtaskqueueoptions/)
