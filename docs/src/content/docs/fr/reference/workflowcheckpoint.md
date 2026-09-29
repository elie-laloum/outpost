---
title: "WorkflowCheckpoint"
description: "WorkflowCheckpoint — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowCheckpoint } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                                | Présence | Rôle                                                                                                                                                                                                                |
| ------------- | --------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`      | `1`                                                 | Requis   | Version du format de sérialisation, toujours 1.                                                                                                                                                                     |
| `identity`    | `string`                                            | Requis   | SHA-256 du nom du workflow, de la version du checkpoint et du graphe des tâches : clés, dépendances, timeout, retry, condition, gates, boucles et interactions. Une identité différente fait refuser le checkpoint. |
| `executionId` | `string`                                            | Requis   | Identité de l’exécution conservée d’une reprise à l’autre. context.idempotencyKey en dérive avec la clé de la tâche et reste donc le même pour chaque tâche.                                                        |
| `records`     | `readonly Readonly<TaskRecord>[]`                   | Requis   | Un enregistrement par tâche : statut, tentatives, horodatages, erreur, reçus d’usage et état éventuel de gate, de question, de quota, de boucle ou de cache.                                                        |
| `values`      | `Readonly<Record<string, WorkflowCheckpointValue>>` | Requis   | Sortie de chaque tâche done, indexée par clé de tâche. Restaurée à la reprise, si bien qu’une tâche done ne s’exécute plus.                                                                                         |
| `usage`       | `WorkflowUsage`                                     | Requis   | Tentatives et usage de tokens cumulés sur toutes les reprises ; ses tentatives doivent égaler la somme de celles des enregistrements. Le budget d’une exécution reprise part de ces totaux.                         |

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
