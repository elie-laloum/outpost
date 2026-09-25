---
title: "BullMQTaskQueue"
description: "BullMQTaskQueue — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { BullMQTaskQueue } from "@elie-laloum/outpost/queues/bullmq";
```

## Parameters and properties

| Name       | Type                                                            | Presence | Meaning                                                                                                                                                                                                                                                 |
| ---------- | --------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `close`    | `() => Promise<void>`                                           | Required | Idempotently rejects new operations, waits for admitted operations, stops stalled checks and closes owned Redis connections. Stop and await runQueueWorker first. Retains jobs, fences and results for later clients; active leases remain reclaimable. |
| `enqueue`  | `(request: QueueRequest) => Promise<QueueJob>`                  | Required | Persist a JSON job request, deduplicating by ID and rejecting conflicting requests.                                                                                                                                                                     |
| `get`      | `(id: string) => Promise<QueueJob \| undefined>`                | Required | Return the current persisted job for an ID, or undefined if absent.                                                                                                                                                                                     |
| `claim`    | `(request: QueueClaim) => Promise<QueueJob \| undefined>`       | Required | Acquire an eligible job for one of the worker’s registered handlers with a new lease fence.                                                                                                                                                             |
| `renew`    | `(lease: QueueLease, leaseMs: number) => Promise<QueueJob>`     | Required | Extend the current worker lease; reject a stale worker or fence.                                                                                                                                                                                        |
| `complete` | `(lease: QueueLease, result: QueueResult) => Promise<QueueJob>` | Required | Persist a job result only while the worker still owns the matching fenced lease.                                                                                                                                                                        |
| `cancel`   | `(id: string, fence: number) => Promise<QueueJob>`              | Required | Cancel a job only if its current fence matches the supplied generation.                                                                                                                                                                                 |

## Signature

```ts
export interface BullMQTaskQueue extends TaskQueue {
  close(): Promise<void>;
}
```

## Related contracts

- [TaskQueue](../taskqueue/)
