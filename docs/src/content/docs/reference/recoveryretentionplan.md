---
title: "RecoveryRetentionPlan"
description: "RecoveryRetentionPlan — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryRetentionPlan**. See the [recovery and retention guide](../../operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryRetentionPlan } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryRetentionPlan {
  readonly repository: string;
  readonly policy: RecoveryRetentionPolicy;
  readonly inspectedAt: string;
  readonly inspection: RecoveryInspection;
  readonly entries: readonly RecoveryRetentionEntry[];
  readonly complete: boolean;
  readonly usageBytes: number;
  readonly projectedBytes: number;
  readonly quota: "within" | "exceeded" | "unknown";
}
```

## Related contracts

- [RecoveryInspection](../support-recoveryinspection/)
- [RecoveryRetentionEntry](../recoveryretentionentry/)
- [RecoveryRetentionPolicy](../recoveryretentionpolicy/)
