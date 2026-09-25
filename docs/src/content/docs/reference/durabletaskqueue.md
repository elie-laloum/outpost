---
title: "DurableTaskQueue"
description: "DurableTaskQueue — Outpost API"
sidebar:
  order: 10
---

Public contract for **DurableTaskQueue**. See the [distributed execution guide](../../guide/advanced/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { DurableTaskQueue } from "@elie-laloum/outpost";
```

## Purpose and behavior

Coordinate durable JSON jobs through a SQLite queue, authenticated HTTP transport and registered workers.

Effects are at least once. Stale fences cannot complete queue state, but external effects may repeat. HTTP binds loopback by default and supplies no TLS. One worker handles one job at a time.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name       | Type                                                            | Presence | Meaning                                                                 |
| ---------- | --------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `close`    | `() => void`                                                    | Required | See the linked contract and this family's rules for its interpretation. |
| `enqueue`  | `(request: QueueRequest) => Promise<QueueJob>`                  | Required | See the linked contract and this family's rules for its interpretation. |
| `get`      | `(id: string) => Promise<QueueJob \| undefined>`                | Required | See the linked contract and this family's rules for its interpretation. |
| `claim`    | `(request: QueueClaim) => Promise<QueueJob \| undefined>`       | Required | See the linked contract and this family's rules for its interpretation. |
| `renew`    | `(lease: QueueLease, leaseMs: number) => Promise<QueueJob>`     | Required | See the linked contract and this family's rules for its interpretation. |
| `complete` | `(lease: QueueLease, result: QueueResult) => Promise<QueueJob>` | Required | See the linked contract and this family's rules for its interpretation. |
| `cancel`   | `(id: string, fence: number) => Promise<QueueJob>`              | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface DurableTaskQueue extends TaskQueue {
  close(): void;
}
```

## Related contracts

- [TaskQueue](../taskqueue/)
