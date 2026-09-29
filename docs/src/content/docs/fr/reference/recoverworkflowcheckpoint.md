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

Efface le propriétaire du checkpoint d’une exécution et conserve sa progression. Échoue avec TransportConflict si l’objet est absent ou si sa révision diffère de revision. Arrêtez d’abord l’ancien exécuteur ; ses tâches interrompues ne sont rejouées qu’avec resume: "retry-incomplete".

[Exemple complet et règles détaillées](../../guide/durable-runs/).

## Paramètres et propriétés

| Nom                   | Type                        | Présence | Rôle                                                                                                                                                   |
| --------------------- | --------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`             | `CheckpointRecoveryOptions` | Requis   | Exécution et révision observée à déverrouiller après que l’appelant a arrêté indépendamment l’ancien exécuteur.                                        |
| `options.runId`       | `string`                    | Requis   | Identité de l’exécution dont la propriété est explicitement libérée ; les valeurs du checkpoint restent intactes.                                      |
| `options.revision`    | `string`                    | Requis   | Révision de l’objet de checkpoint lue après l’arrêt de l’ancien exécuteur ; si l’objet a changé depuis, la récupération échoue avec TransportConflict. |
| `options.transporter` | `Transport`                 | Requis   | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport.            |

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
