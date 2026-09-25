---
title: "restoreRecoveryTransfer"
description: "restoreRecoveryTransfer — Outpost API"
sidebar:
  order: 10
---

Contrat public de **restoreRecoveryTransfer**. Consultez le [guide restauration de récupération](../../guide/operations/recovery-restoration/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { restoreRecoveryTransfer } from "@elie-laloum/outpost";
```

## Rôle et comportement

Planifier puis appliquer un transfert conservé vers une nouvelle destination à relire.

Restaurez dans un nouveau dossier et examinez avant intégration. La vérification contrôle structure et intégrité enregistrées ; elle n’authentifie pas l’auteur.

[Exemple complet et règles détaillées](../../guide/operations/recovery-restoration/).

## Paramètres et propriétés

| Nom    | Type                  | Présence | Rôle                                                                             |
| ------ | --------------------- | -------- | -------------------------------------------------------------------------------- |
| `plan` | `RecoveryRestorePlan` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
