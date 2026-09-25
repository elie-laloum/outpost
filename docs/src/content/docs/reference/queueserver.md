---
title: "QueueServer"
description: "QueueServer — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueueServer**. See the [distributed execution guide](../../guide/advanced/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueueServer } from "@elie-laloum/outpost";
```

## Purpose and behavior

Coordinate durable JSON jobs through a SQLite queue, authenticated HTTP transport and registered workers.

Effects are at least once. Stale fences cannot complete queue state, but external effects may repeat. HTTP binds loopback by default and supplies no TLS. One worker handles one job at a time.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name    | Type                  | Presence | Meaning                                                                 |
| ------- | --------------------- | -------- | ----------------------------------------------------------------------- |
| `url`   | `string`              | Required | See the linked contract and this family's rules for its interpretation. |
| `close` | `() => Promise<void>` | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface QueueServer {
  readonly url: string;
  close(): Promise<void>;
}
```
