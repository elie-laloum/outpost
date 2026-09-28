---
title: "OperationEvent"
description: "OperationEvent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { OperationEvent } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                                  | Presence | Meaning                                                                               |
| ------------ | ------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| `kind`       | `"operation"`                         | Required | Discriminant for an Outpost lifecycle operation.                                      |
| `id`         | `string`                              | Required | Unique identifier shared by the start and terminal event of this operation.           |
| `name`       | `string`                              | Required | Stable operation name, without command arguments, credentials or repository contents. |
| `status`     | `"finished" \| "failed" \| "started"` | Required | Started, finished successfully or failed; terminal events carry elapsed duration.     |
| `durationMs` | `number \| undefined`                 | Optional | Elapsed monotonic duration in milliseconds on finished or failed events.              |

## Signature

```ts
export interface OperationEvent {
  readonly kind: "operation";
  readonly id: string;
  readonly name: string;
  readonly status: "started" | "finished" | "failed";
  readonly durationMs?: number;
}
```
