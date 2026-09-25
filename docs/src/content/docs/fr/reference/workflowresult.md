---
title: "WorkflowResult"
description: "WorkflowResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                                            | Présence | Rôle                                                                                                                                              |
| ---------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `executionId`    | `string`                                        | Requis   | Identité de l’exécution de workflow, conservée lors de la reprise d’un checkpoint.                                                                |
| `name`           | `string`                                        | Requis   | Nom de la définition de workflow, inclus dans ses rapports d’exécution.                                                                           |
| `status`         | `"done" \| "failed" \| "cancelled" \| "paused"` | Requis   | Résultat global de l’exécution : done, failed, cancelled ou paused.                                                                               |
| `tasks`          | `readonly Readonly<TaskRecord>[]`               | Requis   | États finaux des tâches avec statuts, nombres de tentatives, erreurs et gates en attente.                                                         |
| `errors`         | `readonly unknown[]`                            | Requis   | Échecs de tâches et d’ordonnancement collectés pendant l’exécution du workflow.                                                                   |
| `observerErrors` | `readonly unknown[]`                            | Requis   | Exceptions levées par les callbacks telemetry et observe, collectées indépendamment sans modifier le statut du workflow ni les erreurs de tâches. |
| `usage`          | `WorkflowUsage`                                 | Requis   | Tentatives admises et usage de tokens observé cumulés, y compris la comptabilité restaurée.                                                       |
| `value`          | `<T>(task: Task<T>) => T`                       | Requis   | Lit la sortie typée d’une tâche réussie par identité de tâche ; rejette les sorties indisponibles.                                                |
| `unwrap`         | `() => void`                                    | Requis   | Revient normalement si l’exécution a réussi ; lève WorkflowFailure pour tout autre résultat de workflow.                                          |

## Signature

```ts
export interface WorkflowResult {
  readonly executionId: string;
  readonly name: string;
  readonly status: "done" | "failed" | "cancelled" | "paused";
  readonly tasks: readonly Readonly<TaskRecord>[];
  readonly errors: readonly unknown[];
  readonly observerErrors: readonly unknown[];
  readonly usage: WorkflowUsage;
  value<T>(task: Task<T>): T;
  unwrap(): void;
}
```

## Contrats associés

- [Task](../type-task/)
- [TaskRecord](../taskrecord/)
- [WorkflowUsage](../workflowusage/)
