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

Revérifie un plan, puis clone le dépôt dans sa destination, se détache sur le commit du plan et applique les patches et fichiers non suivis du côté choisi. Le dépôt et le transfert restent inchangés. Un plan ou un transfert modifié depuis la planification rejette avec le code configuration ; un échec après la création de la destination rejette avec le code workspace et conserve la destination partielle.

[Exemple complet et règles détaillées](../../guide/recovery/).

## Paramètres et propriétés

| Nom           | Type                          | Présence  | Rôle                                                                                                                        |
| ------------- | ----------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| `plan`        | `RecoveryRestorePlan`         | Requis    | Plan renvoyé par planRecoveryRestore(). Tout champ modifié fait échouer le contrôle d’empreinte avec le code configuration. |
| `observation` | `ObservationHub \| undefined` | Optionnel | Hub qui reçoit l’opération recovery restore.apply à son début, à sa fin ou en cas d’échec.                                  |

## Retour

`Promise<RecoveryRestoreResult>`

## Signature

```ts
export declare function restoreRecoveryTransfer(
  plan: RecoveryRestorePlan,
  observation?: ObservationHub,
): Promise<RecoveryRestoreResult>;
```

## Contrats associés

- [ObservationHub](../observationhub/)
- [RecoveryRestorePlan](../recoveryrestoreplan/)
- [RecoveryRestoreResult](../recoveryrestoreresult/)
