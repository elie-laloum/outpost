---
title: "sqliteTaskQueue"
description: "sqliteTaskQueue — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { sqliteTaskQueue } from "@elie-laloum/outpost";
```

## Purpose and behavior

Open a durable SQLite task queue at path. Enqueue deduplicates job identities, claims create fenced leases and stale workers cannot complete queue state. Close the returned database when finished; external effects remain at least once.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name   | Type     | Presence | Meaning                                 |
| ------ | -------- | -------- | --------------------------------------- |
| `path` | `string` | Required | Host path to the SQLite queue database. |

## Returns

`Promise<DurableTaskQueue>`

## Signature

```ts
export declare function sqliteTaskQueue(
  path: string,
): Promise<DurableTaskQueue>;
```

## Related contracts

- [DurableTaskQueue](../durabletaskqueue/)
