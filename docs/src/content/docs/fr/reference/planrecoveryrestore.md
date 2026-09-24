---
title: "planRecoveryRestore"
description: "planRecoveryRestore — Outpost API"
sidebar:
  order: 10
---

Contrat public de **planRecoveryRestore**. Consultez le [guide restauration de récupération](../../operations/recovery-restoration/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { planRecoveryRestore } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function planRecoveryRestore(
  options: RecoveryRestoreOptions,
): Promise<RecoveryRestorePlan>;
```

## Contrats associés

- [RecoveryRestoreOptions](../recoveryrestoreoptions/)
- [RecoveryRestorePlan](../recoveryrestoreplan/)
