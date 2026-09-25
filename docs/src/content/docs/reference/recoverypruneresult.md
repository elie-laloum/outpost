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

| Name       | Type                                                             | Presence | Meaning                                                                    |
| ---------- | ---------------------------------------------------------------- | -------- | -------------------------------------------------------------------------- |
| `removed`  | `readonly string[]`                                              | Required | Paths actually removed after ownership and safety revalidation.            |
| `retained` | `readonly { readonly path: string; readonly reason: string; }[]` | Required | Candidates left in place with the reason each could not be removed.        |
| `after`    | `RecoveryRetentionPlan`                                          | Required | Fresh retention plan computed after pruning, reflecting remaining storage. |

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
