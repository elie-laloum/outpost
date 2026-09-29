---
title: "TriggerFailure"
description: "TriggerFailure — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerFailure } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                               | Presence | Meaning                                                       |
| ---------- | ---------------------------------- | -------- | ------------------------------------------------------------- |
| `path`     | `string`                           | Required | Route path of the failed request.                             |
| `stage`    | `"verify" \| "route" \| "enqueue"` | Required | Failing step: verify (401), route (500) or enqueue (503).     |
| `delivery` | `string \| undefined`              | Optional | Delivery identifier, known only after verification succeeded. |

## Signature

```ts
export interface TriggerFailure {
  readonly path: string;
  readonly stage: "verify" | "route" | "enqueue";
  readonly delivery?: string;
}
```
