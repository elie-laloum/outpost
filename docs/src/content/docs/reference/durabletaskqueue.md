---
title: "DurableTaskQueue"
description: "DurableTaskQueue — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DurableTaskQueue } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                                                            | Presence | Meaning                                                                                     |
| ---------- | --------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `close`    | `() => void`                                                    | Required | Close the owned SQLite database connection.                                                 |
| `enqueue`  | `(request: QueueRequest) => Promise<QueueJob>`                  | Required | Persist a JSON job request, deduplicating by ID and rejecting conflicting requests.         |
| `get`      | `(id: string) => Promise<QueueJob \| undefined>`                | Required | Return the current persisted job for an ID, or undefined if absent.                         |
| `claim`    | `(request: QueueClaim) => Promise<QueueJob \| undefined>`       | Required | Acquire an eligible job for one of the worker’s registered handlers with a new lease fence. |
| `renew`    | `(lease: QueueLease, leaseMs: number) => Promise<QueueJob>`     | Required | Extend the current worker lease; reject a stale worker or fence.                            |
| `complete` | `(lease: QueueLease, result: QueueResult) => Promise<QueueJob>` | Required | Persist a job result only while the worker still owns the matching fenced lease.            |
| `cancel`   | `(id: string, fence: number) => Promise<QueueJob>`              | Required | Cancel a job only if its current fence matches the supplied generation.                     |

## Signature

```ts
export interface DurableTaskQueue extends TaskQueue {
  close(): void;
}
```

## Related contracts

- [TaskQueue](../taskqueue/)
