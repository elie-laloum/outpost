---
title: "WorkflowEvent"
description: "WorkflowEvent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowEvent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                                                                                                                                                                                  | Présence  | Rôle                                                                                                                                                                                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `executionId` | `string`                                                                                                                                                                                              | Requis    | Identité de l’exécution de workflow, conservée lors de la reprise d’un checkpoint.                                                                                                                                                                                     |
| `workflow`    | `string`                                                                                                                                                                                              | Requis    | Nom du workflow ayant émis cet événement.                                                                                                                                                                                                                              |
| `timestamp`   | `string`                                                                                                                                                                                              | Requis    | Horodatage ISO d’émission de l’événement de workflow.                                                                                                                                                                                                                  |
| `type`        | `"usage" \| "quota" \| "retry" \| "attempt" \| "resume" \| "input-request" \| "input-answer" \| "loop" \| "start" \| "task" \| "finish" \| "gate" \| "decision" \| "checkpoint" \| "budget-exceeded"` | Requis    | Notification du cycle de vie, incluant les phases de boucle, input-request lors d’une suspension, input-answer lorsqu’une réponse acceptée rend la tâche exécutable, et quota lorsqu’une erreur de quota met une tâche en pause ou qu’une tâche en pause est relancée. |
| `resetAt`     | `string \| undefined`                                                                                                                                                                                 | Optionnel | Heure de réinitialisation du quota sur les événements quota, lorsque le fournisseur l’a indiquée.                                                                                                                                                                      |
| `round`       | `number \| undefined`                                                                                                                                                                                 | Optionnel | Numéro du tour logique pour les événements de phase de boucle.                                                                                                                                                                                                         |
| `phase`       | `"complete" \| "attempt" \| "check" \| undefined`                                                                                                                                                     | Optionnel | Phase sauvegardée sur les événements de boucle : attempt, check ou complete.                                                                                                                                                                                           |
| `key`         | `string \| undefined`                                                                                                                                                                                 | Optionnel | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                                                                                                                                                                   |
| `status`      | `TaskStatus \| undefined`                                                                                                                                                                             | Optionnel | État de cycle de vie de tâche, incluant attente, activité, réussite, échec, annulation ou pause/rejet d’une gate. Sur les événements quota, waiting signifie que la tâche sera relancée dans cet appel start() et paused qu’elle reste en pause.                       |
| `attempt`     | `number \| undefined`                                                                                                                                                                                 | Optionnel | Numéro de tentative de tâche commençant à un.                                                                                                                                                                                                                          |
| `usage`       | `Usage \| undefined`                                                                                                                                                                                  | Optionnel | Compteurs d’usage rapportés ; aucune estimation monétaire.                                                                                                                                                                                                             |
| `durationMs`  | `number \| undefined`                                                                                                                                                                                 | Optionnel | Durée d’exécution écoulée en millisecondes.                                                                                                                                                                                                                            |
| `delayMs`     | `number \| undefined`                                                                                                                                                                                 | Optionnel | Attente choisie avant la tentative suivante, présente sur les événements retry et sur les événements quota qui attendent une réinitialisation dans le processus ; inclut backoff, aléa et minimum serveur valide pour les reprises.                                    |

## Signature

```ts
export interface WorkflowEvent {
  readonly executionId: string;
  readonly workflow: string;
  readonly timestamp: string;
  readonly type:
    | "quota"
    | "input-request"
    | "input-answer"
    | "loop"
    | "start"
    | "task"
    | "attempt"
    | "retry"
    | "usage"
    | "finish"
    | "gate"
    | "decision"
    | "checkpoint"
    | "resume"
    | "budget-exceeded";
  readonly resetAt?: string;
  readonly round?: number;
  readonly phase?: "attempt" | "check" | "complete";
  readonly key?: string;
  readonly status?: TaskStatus;
  readonly attempt?: number;
  readonly usage?: Usage;
  readonly durationMs?: number;
  readonly delayMs?: number;
}
```

## Contrats associés

- [TaskStatus](../taskstatus/)
- [Usage](../usage/)
