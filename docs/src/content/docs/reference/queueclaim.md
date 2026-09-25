---
title: "QueueClaim"
description: "QueueClaim — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueClaim } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                | Presence | Meaning                                                        |
| ---------- | ------------------- | -------- | -------------------------------------------------------------- |
| `worker`   | `string`            | Required | Identity of the worker claiming or owning the job lease.       |
| `handlers` | `readonly string[]` | Required | Names of handlers this worker can execute when claiming a job. |
| `leaseMs`  | `number`            | Required | Worker lease duration in milliseconds.                         |

## Signature

```ts
export interface QueueClaim {
  readonly worker: string;
  readonly handlers: readonly string[];
  readonly leaseMs: number;
}
```
