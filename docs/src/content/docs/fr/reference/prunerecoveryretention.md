---
title: "pruneRecoveryRetention"
description: "pruneRecoveryRetention — Outpost API"
sidebar:
  order: 10
---

Contrat public de **pruneRecoveryRetention**. Consultez le [guide récupération et rétention](../../operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { pruneRecoveryRetention } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function pruneRecoveryRetention(
  plan: RecoveryRetentionPlan,
): Promise<RecoveryPruneResult>;
```

## Contrats associés

- [RecoveryPruneResult](../recoverypruneresult/)
- [RecoveryRetentionPlan](../recoveryretentionplan/)
