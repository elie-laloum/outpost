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

| Name       | Type                                                            | Presence | Meaning                                                                                                                                                                                                             |
| ---------- | --------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `close`    | `() => Promise<void>`                                           | Required | Refuse new operations, wait for those in progress, then close the queue’s Redis connections; a second call returns the same promise. Stop and await runQueueWorker() first; jobs, fences and results stay in Redis. |
| `enqueue`  | `(request: QueueRequest) => Promise<QueueJob>`                  | Required | Store a pending job, or return the stored job, in any status, when the ID already holds an identical request. A different request under an existing ID is rejected.                                                 |
| `get`      | `(id: string) => Promise<QueueJob \| undefined>`                | Required | Return the job for an ID, or undefined when absent; a job past its deadline comes back cancelled.                                                                                                                   |
| `claim`    | `(request: QueueClaim) => Promise<QueueJob \| undefined>`       | Required | Take a pending job, or an active job whose lease expired, for one of the listed handlers; increment its fence and start a lease. Returns undefined when no job is eligible.                                         |
| `renew`    | `(lease: QueueLease, leaseMs: number) => Promise<QueueJob>`     | Required | Extend the lease by leaseMs, capped at the job’s deadline. Rejects with Stale queue lease when the worker, fence or lease expiry no longer match.                                                                   |
| `complete` | `(lease: QueueLease, result: QueueResult) => Promise<QueueJob>` | Required | Store the result and mark the job done, or failed when result.error is set. Rejects with Stale queue lease unless the lease is still current.                                                                       |
| `cancel`   | `(id: string, fence: number) => Promise<QueueJob>`              | Required | Cancel a pending or active job and increment its fence; a finished job is returned unchanged. Rejects with Stale queue fence when fence differs from the job’s current fence.                                       |

## Signature

```ts
export interface BullMQTaskQueue extends TaskQueue {
  close(): Promise<void>;
}
```

## Related contracts

- [TaskQueue](../taskqueue/)
