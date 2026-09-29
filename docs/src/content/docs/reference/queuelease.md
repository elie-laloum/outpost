---
title: "QueueLease"
description: "QueueLease — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueLease } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type     | Presence | Meaning                                                                      |
| -------- | -------- | -------- | ---------------------------------------------------------------------------- |
| `id`     | `string` | Required | ID of the leased job.                                                        |
| `worker` | `string` | Required | Name of the worker holding the lease.                                        |
| `fence`  | `number` | Required | Fence returned by the claim; a later claim or a cancellation makes it stale. |

## Signature

```ts
export interface QueueLease {
  readonly id: string;
  readonly worker: string;
  readonly fence: number;
}
```
