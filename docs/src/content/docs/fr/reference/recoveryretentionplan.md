---
title: "RecoveryRetentionPlan"
description: "RecoveryRetentionPlan — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryRetentionPlan**. Consultez le [guide récupération et rétention](../../operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [RecoveryInspection](../recoveryinspection/)
- [RecoveryRetentionEntry](../recoveryretentionentry/)
- [RecoveryRetentionPolicy](../recoveryretentionpolicy/)
