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
| `cacheHit`      | `true \| undefined`                       | Optionnel | true lorsque la valeur de la tâche a été restaurée depuis son cache dans cette exécution ; la tâche compte alors zéro tentative.                                                            |
| `quota`         | `WorkflowQuotaPause \| undefined`         | Optionnel | Pause sur quota persistée d’une tâche en pause : moment de l’enregistrement, message de quota et heure de réinitialisation lorsqu’elle est connue. Supprimée lorsque la tâche est relancée. |
| `interaction`   | `TaskInteractionRecord \| undefined`      | Optionnel | État de continuation persisté, dernière question et réponse acceptée d’une tâche interactive.                                                                                               |
| `rounds`        | `readonly LoopRoundRecord[] \| undefined` | Optionnel | Progression ordonnée d’une tâche de boucle, avec tours terminés et phase courante ; absent pour les tâches ordinaires.                                                                      |
| `usageReceipts` | `readonly string[] \| undefined`          | Optionnel | Identifiants de reçus persistés empêchant de comptabiliser plusieurs fois le même rapport d’usage.                                                                                          |
| `pause`         | `WorkflowPauseRequest \| undefined`       | Optionnel | Demande de gate persistée en attente, avec son identifiant unique et ses acteurs autorisés.                                                                                                 |
| `decision`      | `WorkflowDecisionRecord \| undefined`     | Optionnel | Décision validée enregistrée pour la gate de la tâche.                                                                                                                                      |
| `key`           | `string`                                  | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                                                                                        |
| `status`        | `TaskStatus`                              | Requis    | État de la tâche : waiting, active, done, failed, skipped, cancelled, paused (gate ou quota), rejected ou waiting-input.                                                                    |
| `attempts`      | `number`                                  | Requis    | Tentatives démarrées, cumulées sur les relances et les reprises de checkpoint ; 0 pour une tâche ignorée ou un cache trouvé.                                                                |
| `startedAt`     | `string \| undefined`                     | Optionnel | Horodatage ISO du dernier démarrage de la tâche.                                                                                                                                            |
| `finishedAt`    | `string \| undefined`                     | Optionnel | Horodatage ISO auquel la tâche a atteint son statut actuel, y compris paused et waiting-input.                                                                                              |
| `error`         | `string \| undefined`                     | Optionnel | Message de l’erreur qui a fait échouer ou annulé la tâche, ou du rejet de sa gate.                                                                                                          |

## Signature

```ts
export interface TaskRecord {
  cacheHit?: true;
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
