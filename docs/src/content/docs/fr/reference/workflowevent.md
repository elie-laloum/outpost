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

| Nom           | Type                                                               | Présence  | Rôle                                                                                                              |
| ------------- | ------------------------------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------- |
| `executionId` | `string`                                                           | Requis    | Identité de l’exécution de workflow, conservée lors de la reprise d’un checkpoint.                                |
| `workflow`    | `string`                                                           | Requis    | Nom du workflow ayant émis cet événement.                                                                         |
| `timestamp`   | `string`                                                           | Requis    | Horodatage ISO d’émission de l’événement de workflow.                                                             |
| `type`        | `"usage" \| "retry" \| "start" \| "task" \| "attempt" \| "finish"` | Requis    | Catégorie d’événement : début/fin d’exécution, transition de tâche, tentative, reprise ou rapport d’usage.        |
| `key`         | `string \| undefined`                                              | Optionnel | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                              |
| `status`      | `TaskStatus \| undefined`                                          | Optionnel | État de cycle de vie de tâche, incluant attente, activité, réussite, échec, annulation ou pause/rejet d’une gate. |
| `attempt`     | `number \| undefined`                                              | Optionnel | Numéro de tentative de tâche commençant à un.                                                                     |
| `usage`       | `Usage \| undefined`                                               | Optionnel | Compteurs d’usage rapportés ; aucune estimation monétaire.                                                        |
| `durationMs`  | `number \| undefined`                                              | Optionnel | Durée d’exécution écoulée en millisecondes.                                                                       |

## Signature

```ts
export interface WorkflowEvent {
  readonly executionId: string;
  readonly workflow: string;
  readonly timestamp: string;
  readonly type: "start" | "task" | "attempt" | "retry" | "usage" | "finish";
  readonly key?: string;
  readonly status?: TaskStatus;
  readonly attempt?: number;
  readonly usage?: Usage;
  readonly durationMs?: number;
}
```

## Contrats associés

- [TaskStatus](../taskstatus/)
- [Usage](../usage/)
