---
title: "createTaskCacheStore"
description: "createTaskCacheStore — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createTaskCacheStore } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a task cache store over a caller-owned Transport. Entries live under task-cache/&lt;fingerprint>.json; writes replace older entries conditionally and keep a concurrent writer’s entry. Reads validate the entry and its size. Entries are not authenticated: anyone who can write the transport controls restored results.

[Complete example and detailed rules](../../guide/task-cache/).

## Parameters and properties

| Name                  | Type                    | Presence | Meaning                                                                                                                    |
| --------------------- | ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `TaskCacheStoreOptions` | Required | Transport that stores entries under task-cache/ and an optional entry size bound.                                          |
| `options.maxBytes`    | `number \| undefined`   | Optional | Positive maximum serialized entry size in bytes, default 16 MiB; enforced when writing and reading.                        |
| `options.transporter` | `Transport`             | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |

## Returns

`TaskCacheStore`

## Signature

```ts
export declare function createTaskCacheStore(
  options: TaskCacheStoreOptions,
): TaskCacheStore;
```

## Related contracts

- [TaskCacheStore](../type-taskcachestore/)
- [TaskCacheStoreOptions](../taskcachestoreoptions/)
