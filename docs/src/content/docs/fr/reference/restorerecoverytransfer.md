---
title: "restoreRecoveryTransfer"
description: "restoreRecoveryTransfer — Outpost API"
sidebar:
  order: 10
---

Contrat public de **restoreRecoveryTransfer**. Consultez le [guide restauration de récupération](../../operations/recovery-restoration/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { restoreRecoveryTransfer } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function restoreRecoveryTransfer(
  plan: RecoveryRestorePlan,
): Promise<RecoveryRestoreResult>;
```

## Contrats associés

- [RecoveryRestorePlan](../recoveryrestoreplan/)
- [RecoveryRestoreResult](../recoveryrestoreresult/)
