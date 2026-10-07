---
title: "WorkflowBudget"
description: "WorkflowBudget — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowBudget } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                                                                          | Presence | Meaning                                                                                                                                                                                                             |
| ---------- | ----------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prices`   | `ModelPriceTable \| undefined`                                                | Optional | Model rates per million tokens. Enables model attribution in built-in workflow task helpers and adds cost to result.usage, even without a monetary limit. Copied when accounting starts.                            |
| `cost`     | `{ readonly currency: "EUR" \| "USD"; readonly limit: number; } \| undefined` | Optional | Shared monetary limit with currency and finite nonnegative limit. Requires prices in the same currency; reaching it cancels running attempts and blocks admissions. Unknown cost fails even with an attempts limit. |
| `attempts` | `number \| undefined`                                                         | Optional | Maximum task attempts admitted over the run and its checkpoint resumes. Reaching it cancels the tasks not yet started.                                                                                              |
| `usage`    | `Partial<Omit<Usage, "models" \| "complete">> \| undefined`                   | Optional | Token limits per counter (input, cached, cacheCreated, output). Reaching one cancels running tasks too; usage reported late can exceed it.                                                                          |

## Signature

```ts
export interface WorkflowBudget {
  readonly prices?: ModelPriceTable;
  readonly cost?: {
    readonly currency: "EUR" | "USD";
    readonly limit: number;
  };
  readonly attempts?: number;
  readonly usage?: Partial<Omit<Usage, "complete" | "models">>;
}
```

## Related contracts

- [ModelPriceTable](../modelpricetable/)
- [Usage](../usage/)
