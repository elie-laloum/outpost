---
title: "RecoveryPruneResult"
description: "RecoveryPruneResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryPruneResult**. See the [recovery and retention guide](../../operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryPruneResult } from "@elie-laloum/outpost";
```

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
