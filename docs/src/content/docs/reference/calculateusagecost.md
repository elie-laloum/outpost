---
title: "calculateUsageCost"
description: "calculateUsageCost — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { calculateUsageCost } from "@elie-laloum/outpost";
```

## Purpose and behavior

Estimate token charges in the table’s currency from Usage.models. Rates are per million tokens. Cache reads and writes are charged once using each model’s input convention; omitted cache rates use the input rate. Missing model attribution, prices or usage return complete: false and a lower bound. Invalid counters or prices throw. This is an estimate, not an invoice.

[Complete example and detailed rules](../../guide/estimating-costs/).

## Parameters and properties

| Name     | Type              | Presence | Meaning                                                        |
| -------- | ----------------- | -------- | -------------------------------------------------------------- |
| `usage`  | `Usage`           | Required | Aggregate token usage with optional model-attributed counters. |
| `prices` | `ModelPriceTable` | Required | Explicit rates and currency used for this estimate.            |

## Returns

`UsageCost`

## Signature

```ts
export declare function calculateUsageCost(
  usage: Usage,
  prices: ModelPriceTable,
): UsageCost;
```

## Related contracts

- [ModelPriceTable](../modelpricetable/)
- [Usage](../usage/)
- [UsageCost](../usagecost/)
