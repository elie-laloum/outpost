---
title: "RecoveryPruneResult"
description: "RecoveryPruneResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryPruneResult**. Consultez le [guide récupération et rétention](../../operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [RecoveryRetentionPlan](../recoveryretentionplan/)
