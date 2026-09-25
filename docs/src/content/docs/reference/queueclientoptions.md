---
title: "QueueClientOptions"
description: "QueueClientOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueueClientOptions**. See the [distributed execution guide](../../guide/advanced/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueueClientOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Coordinate durable JSON jobs through a SQLite queue, authenticated HTTP transport and registered workers.

Effects are at least once. Stale fences cannot complete queue state, but external effects may repeat. HTTP binds loopback by default and supplies no TLS. One worker handles one job at a time.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name        | Type                  | Presence | Meaning                                                                 |
| ----------- | --------------------- | -------- | ----------------------------------------------------------------------- |
| `url`       | `string`              | Required | See the linked contract and this family's rules for its interpretation. |
| `token`     | `string`              | Required | Explicit transport credential; never place it in a URL.                 |
| `timeoutMs` | `number \| undefined` | Optional | Time limit in milliseconds for the owning operation.                    |

## Signature

```ts
export interface QueueClientOptions {
  readonly url: string;
  readonly token: string;
  readonly timeoutMs?: number;
}
```
