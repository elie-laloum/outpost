---
title: "QueueWorkerOptions"
description: "QueueWorkerOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueueWorkerOptions**. See the [distributed execution guide](../../guide/advanced/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueueWorkerOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Coordinate durable JSON jobs through a SQLite queue, authenticated HTTP transport and registered workers.

Effects are at least once. Stale fences cannot complete queue state, but external effects may repeat. HTTP binds loopback by default and supplies no TLS. One worker handles one job at a time.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name       | Type                                     | Presence | Meaning                                                                 |
| ---------- | ---------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `queue`    | `TaskQueue`                              | Required | See the linked contract and this family's rules for its interpretation. |
| `worker`   | `string`                                 | Required | See the linked contract and this family's rules for its interpretation. |
| `handlers` | `Readonly<Record<string, QueueHandler>>` | Required | See the linked contract and this family's rules for its interpretation. |
| `signal`   | `AbortSignal`                            | Required | Cooperative cancellation for this operation.                            |
| `leaseMs`  | `number \| undefined`                    | Optional | Worker lease duration in milliseconds.                                  |
| `pollMs`   | `number \| undefined`                    | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface QueueWorkerOptions {
  readonly queue: TaskQueue;
  readonly worker: string;
  readonly handlers: Readonly<Record<string, QueueHandler>>;
  readonly signal: AbortSignal;
  readonly leaseMs?: number;
  readonly pollMs?: number;
}
```

## Related contracts

- [QueueHandler](../queuehandler/)
- [TaskQueue](../taskqueue/)
