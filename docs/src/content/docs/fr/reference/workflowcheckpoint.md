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

| Nom           | Type                                                | Présence | Rôle                                                                                            |
| ------------- | --------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `format`      | `1`                                                 | Requis   | Version du format de sérialisation du checkpoint ; actuellement 1.                              |
| `identity`    | `string`                                            | Requis   | Empreinte liant l’état sauvegardé au graphe de workflow et à la version fournie par l’appelant. |
| `executionId` | `string`                                            | Requis   | Identité de l’exécution de workflow, conservée lors de la reprise d’un checkpoint.              |
| `records`     | `readonly Readonly<TaskRecord>[]`                   | Requis   | Statuts, tentatives, décisions et reçus d’usage sauvegardés pour chaque tâche.                  |
| `values`      | `Readonly<Record<string, WorkflowCheckpointValue>>` | Requis   | Sorties terminées sauvegardées par clé de tâche et encodées en JSON ou undefined.               |
| `usage`       | `WorkflowUsage`                                     | Requis   | Tentatives admises et usage de tokens observé cumulés, y compris la comptabilité restaurée.     |

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
