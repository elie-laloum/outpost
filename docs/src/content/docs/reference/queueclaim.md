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

| Name       | Type                | Presence | Meaning                                                                                 |
| ---------- | ------------------- | -------- | --------------------------------------------------------------------------------------- |
| `worker`   | `string`            | Required | Name of the claiming worker, recorded on the job and checked by renew() and complete(). |
| `handlers` | `readonly string[]` | Required | Handler names this worker can run, 1 to 100; only jobs for these handlers are claimed.  |
| `leaseMs`  | `number`            | Required | Lease duration in milliseconds, from 30 to 300000.                                      |

## Signature

```ts
export interface QueueClaim {
  readonly worker: string;
  readonly handlers: readonly string[];
  readonly leaseMs: number;
}
```
