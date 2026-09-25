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

| Name     | Type     | Presence | Meaning                                                           |
| -------- | -------- | -------- | ----------------------------------------------------------------- |
| `id`     | `string` | Required | Durable job identity used for deduplication and lease operations. |
| `worker` | `string` | Required | Identity of the worker claiming or owning the job lease.          |
| `fence`  | `number` | Required | Lease generation used to reject stale queue writers.              |

## Signature

```ts
export interface QueueLease {
  readonly id: string;
  readonly worker: string;
  readonly fence: number;
}
```
