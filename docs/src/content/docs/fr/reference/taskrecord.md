---
title: "TaskRecord"
description: "TaskRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskRecord } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                                      | Présence  | Rôle                                                                                                                                                                                        |
| --------------- | ----------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `quota`         | `WorkflowQuotaPause \| undefined`         | Optionnel | Pause sur quota persistée d’une tâche en pause : moment de l’enregistrement, message de quota et heure de réinitialisation lorsqu’elle est connue. Supprimée lorsque la tâche est relancée. |
| `interaction`   | `TaskInteractionRecord \| undefined`      | Optionnel | État de continuation persisté, dernière question et réponse acceptée d’une tâche interactive.                                                                                               |
| `rounds`        | `readonly LoopRoundRecord[] \| undefined` | Optionnel | Progression ordonnée d’une tâche de boucle, avec tours terminés et phase courante ; absent pour les tâches ordinaires.                                                                      |
| `usageReceipts` | `readonly string[] \| undefined`          | Optionnel | Identifiants de reçus persistés empêchant de comptabiliser plusieurs fois le même rapport d’usage.                                                                                          |
| `pause`         | `WorkflowPauseRequest \| undefined`       | Optionnel | Demande de gate persistée en attente, avec son identifiant unique et ses acteurs autorisés.                                                                                                 |
| `decision`      | `WorkflowDecisionRecord \| undefined`     | Optionnel | Décision validée enregistrée pour la gate de la tâche.                                                                                                                                      |
| `key`           | `string`                                  | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                                                                                        |
| `status`        | `TaskStatus`                              | Requis    | État de cycle de vie de tâche, incluant attente, activité, réussite, échec, annulation, pause/rejet d’une gate ou pause sur quota.                                                          |
| `attempts`      | `number`                                  | Requis    | Nombre de tentatives réellement démarrées pour cette tâche.                                                                                                                                 |
| `startedAt`     | `string \| undefined`                     | Optionnel | Horodatage ISO du début d’exécution de cette tâche ou opération.                                                                                                                            |
| `finishedAt`    | `string \| undefined`                     | Optionnel | Horodatage ISO de fin d’exécution de cette tâche ou opération.                                                                                                                              |
| `error`         | `string \| undefined`                     | Optionnel | Message d’échec enregistré pour la tâche lorsqu’il existe.                                                                                                                                  |

## Signature

```ts
export interface TaskRecord {
  quota?: WorkflowQuotaPause;
  interaction?: TaskInteractionRecord;
  rounds?: readonly LoopRoundRecord[];
  usageReceipts?: readonly string[];
  pause?: WorkflowPauseRequest;
  decision?: WorkflowDecisionRecord;
  readonly key: string;
  status: TaskStatus;
  attempts: number;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
}
```

## Contrats associés

- [LoopRoundRecord](../looproundrecord/)
- [TaskInteractionRecord](../taskinteractionrecord/)
- [TaskStatus](../taskstatus/)
- [WorkflowDecisionRecord](../workflowdecisionrecord/)
- [WorkflowPauseRequest](../workflowpauserequest/)
- [WorkflowQuotaPause](../workflowquotapause/)
