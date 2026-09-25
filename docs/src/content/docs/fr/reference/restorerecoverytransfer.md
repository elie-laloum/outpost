---
title: "restoreRecoveryTransfer"
description: "restoreRecoveryTransfer — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { restoreRecoveryTransfer } from "@elie-laloum/outpost";
```

## Rôle et comportement

Revalide un plan de restauration et matérialise l’état conservé choisi dans sa nouvelle destination. Les artefacts sources restent disponibles et le résultat indique si l’index Git a pu être préservé. Examinez la destination avant intégration.

[Exemple complet et règles détaillées](../../guide/operations/recovery-restoration/).

## Paramètres et propriétés

| Nom    | Type                  | Présence | Rôle                                                                                   |
| ------ | --------------------- | -------- | -------------------------------------------------------------------------------------- |
| `plan` | `RecoveryRestorePlan` | Requis   | Plan de restauration liant source, destination, état choisi et empreintes d’intégrité. |

## Retour

`Promise<RecoveryRestoreResult>`

## Signature

```ts
export declare function restoreRecoveryTransfer(
  plan: RecoveryRestorePlan,
): Promise<RecoveryRestoreResult>;
```

## Contrats associés

- [RecoveryRestorePlan](../recoveryrestoreplan/)
- [RecoveryRestoreResult](../recoveryrestoreresult/)
