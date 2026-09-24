---
title: "planRecoveryRetention"
description: "planRecoveryRetention — Outpost API"
sidebar:
  order: 10
---

Contrat public de **planRecoveryRetention**. Consultez le [guide récupération et rétention](../../operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { planRecoveryRetention } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function planRecoveryRetention(
  options: RecoveryRetentionOptions,
): Promise<RecoveryRetentionPlan>;
```

## Contrats associés

- [RecoveryRetentionOptions](../recoveryretentionoptions/)
- [RecoveryRetentionPlan](../recoveryretentionplan/)
