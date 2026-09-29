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

| Nom              | Type                                                               | Présence | Rôle                                                                                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inputRequests`  | `readonly WorkflowInputRequest[]`                                  | Requis   | Questions immuables des tâches en waiting-input ; vide lorsqu’aucune réponse humaine n’est attendue.                                                                                                            |
| `executionId`    | `string`                                                           | Requis   | Identité de l’exécution de workflow, conservée lors de la reprise d’un checkpoint.                                                                                                                              |
| `name`           | `string`                                                           | Requis   | Nom de la définition de workflow, inclus dans ses rapports d’exécution.                                                                                                                                         |
| `status`         | `"failed" \| "waiting-input" \| "done" \| "cancelled" \| "paused"` | Requis   | Résultat de l’exécution : done, paused (gate ou quota), waiting-input, failed ou cancelled. L’ordre de priorité est cancelled, puis failed, puis waiting-input, puis paused ; un timeoutMs expiré donne failed. |
| `tasks`          | `readonly Readonly<TaskRecord>[]`                                  | Requis   | Un enregistrement figé par tâche, dans l’ordre de la liste, avec statut, tentatives, horodatages et erreur.                                                                                                     |
| `errors`         | `readonly unknown[]`                                               | Requis   | Erreurs qui ont fait échouer l’exécution : échecs de tâches, rejets de gates, erreurs de budget et motif d’annulation ou de dépassement de délai.                                                               |
| `observerErrors` | `readonly unknown[]`                                               | Requis   | Exceptions levées par les callbacks telemetry et observe, collectées indépendamment sans modifier le statut du workflow ni les erreurs de tâches.                                                               |
| `usage`          | `WorkflowUsage`                                                    | Requis   | Tentatives admises et usage de tokens observé cumulés, y compris la comptabilité restaurée.                                                                                                                     |
| `value`          | `<T>(task: Task<T>) => T`                                          | Requis   | Renvoie la sortie d’une tâche issue de cette exécution ou de son checkpoint restauré ; lève une erreur si la tâche n’a pas de valeur done.                                                                      |
| `unwrap`         | `() => void`                                                       | Requis   | Retourne normalement quand status vaut done ; sinon lève WorkflowFailure.                                                                                                                                       |

## Signature

```ts
export interface WorkflowResult {
  readonly inputRequests: readonly WorkflowInputRequest[];
  readonly executionId: string;
  readonly name: string;
  readonly status: "done" | "failed" | "cancelled" | "paused" | "waiting-input";
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
- [WorkflowInputRequest](../workflowinputrequest/)
- [WorkflowUsage](../workflowusage/)
