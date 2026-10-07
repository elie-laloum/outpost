---
title: "UsageCost"
description: "UsageCost — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { UsageCost } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type             | Presence | Meaning                                                                                              |
| ---------- | ---------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `currency` | `"EUR" \| "USD"` | Required | Currency of the table used to estimate this usage.                                                   |
| `amount`   | `number`         | Required | Estimated amount in major currency units; a lower bound when complete is false.                      |
| `complete` | `boolean`        | Required | True only when every reported token is attributable to a priced model and all counters are complete. |

## Signature

```ts
export interface UsageCost {
  readonly currency: "EUR" | "USD";
  readonly amount: number;
  readonly complete: boolean;
}
```
