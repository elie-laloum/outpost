---
title: "workflowCheckpointStore"
description: "workflowCheckpointStore — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { workflowCheckpointStore } from "@elie-laloum/outpost";
```

## Rôle et comportement

Construit un store dont le jeton de propriété et le checkpoint partagent un objet conditionnel. L’acquisition refuse un propriétaire existant. La libération préserve valeurs et usage. La propriété n’expire pas automatiquement ; après un crash, arrêter l’ancien exécuteur et récupérer explicitement sa révision observée avant reprise.

[Exemple complet et règles détaillées](../../guide/operations/storage-transports/).

## Paramètres et propriétés

| Nom                   | Type                    | Présence | Rôle                                                                                                                                        |
| --------------------- | ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `TransportStoreOptions` | Requis   | Transport conservant les enveloppes de checkpoint et leur propriété exclusive par exécution.                                                |
| `options.transporter` | `Transport`             | Requis   | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |

## Retour

`WorkflowCheckpointStore`

## Signature

```ts
export declare function workflowCheckpointStore(
  options: TransportStoreOptions,
): WorkflowCheckpointStore;
```

## Contrats associés

- [TransportStoreOptions](../transportstoreoptions/)
- [WorkflowCheckpointStore](../workflowcheckpointstore/)
