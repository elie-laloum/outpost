---
title: "WorkflowOptions"
description: "WorkflowOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowOptions**. Consultez le [guide workflows](../../guide/workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Composer des tâches avec dépendances explicites et accès typé aux résultats.

Les clés dupliquées, dépendances absentes et cycles échouent à la validation. Une dépendance en échec ou ignorée empêche ses descendants. Les reprises peuvent répéter les effets externes. Unwrap lève une erreur en cas de non-succès.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom           | Type                                            | Présence  | Rôle                                                                             |
| ------------- | ----------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `decisions`   | `readonly WorkflowDecision[] \| undefined`      | Optionnel | Décisions explicites pour les gates persistés en attente.                        |
| `checkpoint`  | `WorkflowCheckpointOptions \| undefined`        | Optionnel | Stockage durable de l’exécution et configuration de rejeu.                       |
| `signal`      | `AbortSignal \| undefined`                      | Optionnel | Annulation coopérative de cette opération.                                       |
| `concurrency` | `number \| undefined`                           | Optionnel | Nombre maximal de tâches ou candidats concurrents admis.                         |
| `budget`      | `WorkflowBudget \| undefined`                   | Optionnel | Limites partagées de tentatives et d’usage observé.                              |
| `stopOnError` | `boolean \| undefined`                          | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `observe`     | `((event: WorkflowEvent) => void) \| undefined` | Optionnel | Callback d’observation ; ses erreurs sont isolées.                               |

## Signature

```ts
export interface WorkflowOptions {
  readonly decisions?: readonly WorkflowDecision[];
  readonly checkpoint?: WorkflowCheckpointOptions;
  readonly signal?: AbortSignal;
  readonly concurrency?: number;
  readonly budget?: WorkflowBudget;
  readonly stopOnError?: boolean;
  readonly observe?: (event: WorkflowEvent) => void;
}
```

## Contrats associés

- [WorkflowBudget](../workflowbudget/)
- [WorkflowCheckpointOptions](../workflowcheckpointoptions/)
- [WorkflowDecision](../workflowdecision/)
- [WorkflowEvent](../workflowevent/)
