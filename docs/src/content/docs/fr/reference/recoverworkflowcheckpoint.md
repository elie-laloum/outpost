---
title: "recoverWorkflowCheckpoint"
description: "recoverWorkflowCheckpoint — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { recoverWorkflowCheckpoint } from "@elie-laloum/outpost";
```

## Rôle et comportement

Libère explicitement la propriété d’un checkpoint sans supprimer sa progression. L’appelant doit d’abord s’assurer de l’arrêt de l’ancien exécuteur. La révision attendue protège contre les changements concurrents ; rejouer les tâches incomplètes exige toujours resume: retry-incomplete.

[Exemple complet et règles détaillées](../../guide/operations/storage-transports/).

## Paramètres et propriétés

| Nom                   | Type                        | Présence | Rôle                                                                                                                                        |
| --------------------- | --------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `CheckpointRecoveryOptions` | Requis   | Exécution et révision observée à déverrouiller après que l’appelant a arrêté indépendamment l’ancien exécuteur.                             |
| `options.runId`       | `string`                    | Requis   | Identité de l’exécution dont la propriété est explicitement libérée ; les valeurs du checkpoint restent intactes.                           |
| `options.revision`    | `string`                    | Requis   | Révision observée après arrêt de l’ancien exécuteur ; une révision modifiée fait refuser la récupération.                                   |
| `options.transporter` | `Transport`                 | Requis   | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |

## Retour

`Promise<void>`

## Signature

```ts
export declare function recoverWorkflowCheckpoint(
  options: CheckpointRecoveryOptions,
): Promise<void>;
```

## Contrats associés

- [CheckpointRecoveryOptions](../checkpointrecoveryoptions/)
