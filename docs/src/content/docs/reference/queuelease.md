---
title: "QueueLease"
description: "QueueLease — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueueLease**. See the [distributed execution guide](../../guide/advanced/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueueLease } from "@elie-laloum/outpost";
```

## Purpose and behavior

Coordinate durable JSON jobs through a SQLite queue, authenticated HTTP transport and registered workers.

Effects are at least once. Stale fences cannot complete queue state, but external effects may repeat. HTTP binds loopback by default and supplies no TLS. One worker handles one job at a time.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name     | Type     | Presence | Meaning                                                                 |
| -------- | -------- | -------- | ----------------------------------------------------------------------- |
| `id`     | `string` | Required | See the linked contract and this family's rules for its interpretation. |
| `worker` | `string` | Required | See the linked contract and this family's rules for its interpretation. |
| `fence`  | `number` | Required | Lease generation used to reject stale queue writers.                    |

## Signature

```ts
export interface QueueLease {
  readonly id: string;
  readonly worker: string;
  readonly fence: number;
}
```
