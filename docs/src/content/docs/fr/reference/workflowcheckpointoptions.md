---
title: "WorkflowCheckpointOptions"
description: "WorkflowCheckpointOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowCheckpointOptions**. Consultez le [guide checkpoints de workflow](../../guide/advanced/checkpoints/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowCheckpointOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Persister les résultats sans perte et rouvrir explicitement le même graphe après redémarrage.

Les sorties terminées ne sont pas rejouées. Une tâche ordinaire interrompue exige retry-incomplete. Les sorties doivent être du JSON sans perte ; les résultats de dispatch complets contiennent des fonctions et ne peuvent pas être persistés directement.

[Exemple complet et règles détaillées](../../guide/advanced/checkpoints/).

## Paramètres et propriétés

| Nom       | Type                              | Présence  | Rôle                                                                             |
| --------- | --------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `store`   | `WorkflowCheckpointStore`         | Requis    | Implémentation de persistance fournie par l’appelant.                            |
| `runId`   | `string`                          | Requis    | Identité stable d’une exécution sauvegardée.                                     |
| `version` | `string`                          | Requis    | Version de contrat ou graphe contrôlée par l’appelant.                           |
| `resume`  | `"retry-incomplete" \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface WorkflowCheckpointOptions {
  readonly store: WorkflowCheckpointStore;
  readonly runId: string;
  /** Change when task implementations or workflow inputs change. */
  readonly version: string;
  /** Explicitly authorize replay of incomplete tasks and their side effects. */
  readonly resume?: "retry-incomplete";
}
```

## Contrats associés

- [WorkflowCheckpointStore](../workflowcheckpointstore/)
