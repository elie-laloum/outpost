---
title: "RecoveryPruneResult"
description: "RecoveryPruneResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryPruneResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                                                             | Presence | Meaning                                                                                        |
| ---------- | ---------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `removed`  | `readonly string[]`                                              | Required | Paths or object keys removed.                                                                  |
| `retained` | `readonly { readonly path: string; readonly reason: string; }[]` | Required | Eligible candidates left in place, with reason PLAN_CHANGED or REVALIDATION_OR_REMOVAL_FAILED. |
| `after`    | `RecoveryRetentionPlan`                                          | Required | Fresh plan with the same policy, computed after pruning.                                       |

## Signature

```ts
export interface RecoveryPruneResult {
  readonly removed: readonly string[];
  readonly retained: readonly {
    readonly path: string;
    readonly reason: string;
  }[];
  readonly after: RecoveryRetentionPlan;
}
```

## Related contracts

- [RecoveryRetentionPlan](../recoveryretentionplan/)
