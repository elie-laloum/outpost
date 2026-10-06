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

| Nom               | Type                                                                             | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------- | -------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `terminationCode` | `WorkflowTerminationCode \| undefined`                                           | Optionnel | Motif d’une fin sans succès : rejected pour un refus de gate, aborted pour une annulation externe, timeout pour le délai d’une tâche ou du workflow, limit pour un budget de workflow épuisé, usage-unavailable pour une comptabilité de budget incomplète, le code OutpostError du premier échec technique (y compris ses causes enveloppées), ou failed pour une erreur non classée. Absent pour done, paused et waiting-input ; recalculé depuis les gates restaurées lors de la reprise. |
| `inputRequests`   | `readonly WorkflowInputRequest[]`                                                | Requis    | Questions immuables des tâches en waiting-input ; vide lorsqu’aucune réponse humaine n’est attendue.                                                                                                                                                                                                                                                                                                                                                                                         |
| `executionId`     | `string`                                                                         | Requis    | Identité de l’exécution de workflow, conservée lors de la reprise d’un checkpoint.                                                                                                                                                                                                                                                                                                                                                                                                           |
| `name`            | `string`                                                                         | Requis    | Nom de la définition de workflow, inclus dans ses rapports d’exécution.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `status`          | `"failed" \| "done" \| "cancelled" \| "rejected" \| "waiting-input" \| "paused"` | Requis    | Résultat de l’exécution : done, failed, cancelled, rejected, paused (gate ou quota), ou waiting-input. L’annulation externe ou le délai du workflow est prioritaire, puis viennent l’échec technique, le rejet, l’attente de réponse et la pause. Le délai du workflow donne failed avec terminationCode timeout.                                                                                                                                                                            |
| `tasks`           | `readonly Readonly<TaskRecord>[]`                                                | Requis    | Un enregistrement figé par tâche, dans l’ordre de la liste, avec statut, tentatives, horodatages et erreur.                                                                                                                                                                                                                                                                                                                                                                                  |
| `errors`          | `readonly unknown[]`                                                             | Requis    | Échecs de tâches, rejets de gates, erreurs de budget et motif externe d’annulation ou de dépassement de délai. Le rejet d’une gate utilise OutpostError avec le code rejected et garde la clé de tâche, l’acteur et le motif dans details ; les exécutions rejected conservent cette trace après reprise du checkpoint.                                                                                                                                                                      |
| `observerErrors`  | `readonly unknown[]`                                                             | Requis    | Exceptions levées par les callbacks telemetry et observe, collectées indépendamment sans modifier le statut du workflow ni les erreurs de tâches.                                                                                                                                                                                                                                                                                                                                            |
| `usage`           | `WorkflowUsage`                                                                  | Requis    | Tentatives admises et usage de tokens observé cumulés, y compris la comptabilité restaurée.                                                                                                                                                                                                                                                                                                                                                                                                  |
| `value`           | `<T>(task: Task<T>) => T`                                                        | Requis    | Renvoie la sortie d’une tâche issue de cette exécution ou de son checkpoint restauré ; lève une erreur si la tâche n’a pas de valeur done.                                                                                                                                                                                                                                                                                                                                                   |
| `unwrap`          | `() => void`                                                                     | Requis    | Retourne normalement quand status vaut done ; sinon lève WorkflowFailure.                                                                                                                                                                                                                                                                                                                                                                                                                    |

## Signature

```ts
export interface WorkflowResult {
  readonly terminationCode?: WorkflowTerminationCode;
  readonly inputRequests: readonly WorkflowInputRequest[];
  readonly executionId: string;
  readonly name: string;
  readonly status:
    "done" | "failed" | "cancelled" | "paused" | "waiting-input" | "rejected";
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
- [WorkflowTerminationCode](../workflowterminationcode/)
- [WorkflowUsage](../workflowusage/)
