---
title: "ModelPriceTable"
description: "ModelPriceTable — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ModelPriceTable } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                                   | Presence | Meaning                                                                                                              |
| ---------- | -------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `currency` | `"EUR" \| "USD"`                       | Required | Currency shared by all model rates: EUR or USD. No implicit conversion.                                              |
| `models`   | `Readonly<Record<string, ModelPrice>>` | Required | Exact Outpost model names mapped to rates per million tokens; use explicit aliases to distinguish services or tiers. |

## Signature

```ts
export interface ModelPriceTable {
  readonly currency: "EUR" | "USD";
  readonly models: Readonly<Record<string, ModelPrice>>;
}
```

## Related contracts

- [ModelPrice](../modelprice/)
