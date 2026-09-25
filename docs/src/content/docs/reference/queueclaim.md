---
title: "QueueClaim"
description: "QueueClaim — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueueClaim**. See the [distributed execution guide](../../guide/advanced/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueueClaim } from "@elie-laloum/outpost";
```

## Purpose and behavior

Coordinate durable JSON jobs through a SQLite queue, authenticated HTTP transport and registered workers.

Effects are at least once. Stale fences cannot complete queue state, but external effects may repeat. HTTP binds loopback by default and supplies no TLS. One worker handles one job at a time.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name       | Type                | Presence | Meaning                                                                 |
| ---------- | ------------------- | -------- | ----------------------------------------------------------------------- |
| `worker`   | `string`            | Required | See the linked contract and this family's rules for its interpretation. |
| `handlers` | `readonly string[]` | Required | See the linked contract and this family's rules for its interpretation. |
| `leaseMs`  | `number`            | Required | Worker lease duration in milliseconds.                                  |

## Signature

```ts
export interface QueueClaim {
  readonly worker: string;
  readonly handlers: readonly string[];
  readonly leaseMs: number;
}
```
