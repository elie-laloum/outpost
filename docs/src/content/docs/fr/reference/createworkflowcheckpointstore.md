---
title: "createWorkflowCheckpointStore"
description: "createWorkflowCheckpointStore — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createWorkflowCheckpointStore } from "@elie-laloum/outpost/workflows";
```

## Rôle et comportement

Crée un WorkflowCheckpointStore qui conserve le checkpoint et le propriétaire de chaque exécution dans un seul objet, checkpoints/&lt;SHA-256 du runId>.json. acquire() échoue tant qu’un propriétaire est enregistré. La libération conserve la progression et retente une fois une erreur de stockage en vérifiant le propriétaire et la révision d’origine ; les conflits et erreurs persistantes restent refusés. La propriété n’expire jamais : après un crash, arrêtez l’ancien exécuteur et appelez recoverWorkflowCheckpoint().

[Exemple complet et règles détaillées](../../guide/durable-runs/).

## Paramètres et propriétés

| Nom                   | Type                    | Présence | Rôle                                                                                                                                        |
| --------------------- | ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `TransportStoreOptions` | Requis   | Transport qui contient un objet par exécution sous checkpoints/, avec son checkpoint et son propriétaire.                                   |
| `options.transporter` | `Transport`             | Requis   | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |

## Retour

`WorkflowCheckpointStore`

## Signature

```ts
export declare function createWorkflowCheckpointStore(
  options: TransportStoreOptions,
): WorkflowCheckpointStore;
```

## Contrats associés

- [TransportStoreOptions](../transportstoreoptions/)
- [WorkflowCheckpointStore](../workflowcheckpointstore/)
