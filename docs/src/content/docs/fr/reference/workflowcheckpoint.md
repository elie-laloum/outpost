---
title: "WorkflowCheckpoint"
description: "WorkflowCheckpoint — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowCheckpoint**. Consultez le [guide checkpoints de workflow](../../guide/advanced/checkpoints/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowCheckpoint } from "@elie-laloum/outpost";
```

## Rôle et comportement

Persister les résultats sans perte et rouvrir explicitement le même graphe après redémarrage.

Les sorties terminées ne sont pas rejouées. Une tâche ordinaire interrompue exige retry-incomplete. Les sorties doivent être du JSON sans perte ; les résultats de dispatch complets contiennent des fonctions et ne peuvent pas être persistés directement.

[Exemple complet et règles détaillées](../../guide/advanced/checkpoints/).

## Paramètres et propriétés

| Nom           | Type                                                | Présence | Rôle                                                                             |
| ------------- | --------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `format`      | `1`                                                 | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `identity`    | `string`                                            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `executionId` | `string`                                            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `records`     | `readonly Readonly<TaskRecord>[]`                   | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `values`      | `Readonly<Record<string, WorkflowCheckpointValue>>` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `usage`       | `WorkflowUsage`                                     | Requis   | Compteurs d’usage rapportés ; aucune estimation monétaire.                       |

## Signature

```ts
export interface WorkflowCheckpoint {
  readonly format: 1;
  readonly identity: string;
  readonly executionId: string;
  readonly records: readonly Readonly<TaskRecord>[];
  readonly values: Readonly<Record<string, WorkflowCheckpointValue>>;
  readonly usage: WorkflowUsage;
}
```

## Contrats associés

- [TaskRecord](../taskrecord/)
- [WorkflowCheckpointValue](../workflowcheckpointvalue/)
- [WorkflowUsage](../workflowusage/)
