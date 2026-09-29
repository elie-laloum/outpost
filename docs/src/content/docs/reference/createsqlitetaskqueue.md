---
title: "createSqliteTaskQueue"
description: "createSqliteTaskQueue — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createSqliteTaskQueue } from "@elie-laloum/outpost";
```

## Purpose and behavior

Open or create a SQLite queue database at path, with its parent directory, and return a DurableTaskQueue. Jobs are claimed in insertion order under fenced leases and every write is synced to disk. Call close() once workers and producers have stopped.

[Complete example and detailed rules](../../guide/job-queues/).

## Parameters and properties

| Name   | Type     | Presence | Meaning                                                                                                                            |
| ------ | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `path` | `string` | Required | Path of the SQLite database file, resolved from the current directory; the file and its parent directory are created when missing. |

## Returns

`Promise<DurableTaskQueue>`

## Signature

```ts
export declare function createSqliteTaskQueue(
  path: string,
): Promise<DurableTaskQueue>;
```

## Related contracts

- [DurableTaskQueue](../durabletaskqueue/)
