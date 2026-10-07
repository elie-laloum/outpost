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

| Nom               | Type                                                                                                                                                                                                             | Présence  | Rôle                                                                                                                                                                                                                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `terminationCode` | `WorkflowTerminationCode \| undefined`                                                                                                                                                                           | Optionnel | Motif de terminaison d’un événement finish du workflow, identique à WorkflowResult.terminationCode quand un résultat est renvoyé. Classe aussi les erreurs levées pendant l’ordonnancement ou l’enregistrement du checkpoint ; absent lors d’une fin réussie ou suspendue et sur les autres types d’événements. |
| `executionId`     | `string`                                                                                                                                                                                                         | Requis    | Identité de l’exécution de workflow, conservée lors de la reprise d’un checkpoint.                                                                                                                                                                                                                              |
| `workflow`        | `string`                                                                                                                                                                                                         | Requis    | Nom du workflow ayant émis cet événement.                                                                                                                                                                                                                                                                       |
| `timestamp`       | `string`                                                                                                                                                                                                         | Requis    | Horodatage ISO d’émission de l’événement de workflow.                                                                                                                                                                                                                                                           |
| `type`            | `"decision" \| "usage" \| "quota" \| "cache" \| "input-request" \| "input-answer" \| "loop" \| "start" \| "task" \| "attempt" \| "retry" \| "finish" \| "gate" \| "checkpoint" \| "resume" \| "budget-exceeded"` | Requis    | Type d’événement : start, resume, task, attempt, retry, usage, checkpoint, finish, budget-exceeded, gate, decision, loop, input-request, input-answer, quota ou cache.                                                                                                                                          |
| `cache`           | `TaskCacheOutcome \| undefined`                                                                                                                                                                                  | Optionnel | Résultat du cache sur les événements cache : hit, miss (absent, expiré ou mode refresh), stored, ou failed lorsque le store ou une entrée était inutilisable.                                                                                                                                                   |
| `error`           | `string \| undefined`                                                                                                                                                                                            | Optionnel | Message d’erreur du store ou de l’entrée sur les événements cache failed ; la tâche continue sans cache.                                                                                                                                                                                                        |
| `resetAt`         | `string \| undefined`                                                                                                                                                                                            | Optionnel | Heure de réinitialisation du quota sur les événements quota, lorsque le fournisseur l’a indiquée.                                                                                                                                                                                                               |
| `round`           | `number \| undefined`                                                                                                                                                                                            | Optionnel | Numéro du tour logique pour les événements de phase de boucle.                                                                                                                                                                                                                                                  |
| `phase`           | `"complete" \| "attempt" \| "check" \| undefined`                                                                                                                                                                | Optionnel | Phase sauvegardée sur les événements de boucle : attempt, check ou complete.                                                                                                                                                                                                                                    |
| `key`             | `string \| undefined`                                                                                                                                                                                            | Optionnel | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                                                                                                                                                                                                            |
| `status`          | `TaskStatus \| undefined`                                                                                                                                                                                        | Optionnel | Statut de la tâche sur les événements task, quota et input, ou statut de l’exécution sur finish. Sur les événements quota, waiting signifie que la tâche repart dans cet appel à start() et paused qu’elle reste en pause.                                                                                      |
| `attempt`         | `number \| undefined`                                                                                                                                                                                            | Optionnel | Numéro de tentative de tâche commençant à un.                                                                                                                                                                                                                                                                   |
| `usage`           | `Usage \| undefined`                                                                                                                                                                                             | Optionnel | Compteurs d’usage rapportés ; aucune estimation monétaire.                                                                                                                                                                                                                                                      |
| `durationMs`      | `number \| undefined`                                                                                                                                                                                            | Optionnel | Durée d’exécution écoulée en millisecondes.                                                                                                                                                                                                                                                                     |
| `delayMs`         | `number \| undefined`                                                                                                                                                                                            | Optionnel | Attente choisie avant la tentative suivante, présente sur les événements retry et sur les événements quota qui attendent une réinitialisation dans le processus ; inclut backoff, aléa et minimum serveur valide pour les reprises.                                                                             |

## Signature

```ts
export interface WorkflowEvent {
  readonly terminationCode?: WorkflowTerminationCode;
  readonly executionId: string;
  readonly workflow: string;
  readonly timestamp: string;
  readonly type:
    | "cache"
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
  readonly cache?: TaskCacheOutcome;
  readonly error?: string;
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

- [TaskCacheOutcome](../taskcacheoutcome/)
- [TaskStatus](../taskstatus/)
- [Usage](../usage/)
- [WorkflowTerminationCode](../workflowterminationcode/)
