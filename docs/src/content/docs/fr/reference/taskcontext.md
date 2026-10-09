---
title: "TaskContext"
description: "TaskContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                   | Type                                                     | Présence  | Rôle                                                                                                                                                                                                                           |
| --------------------- | -------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `workspaceCheckpoint` | `TaskWorkspaceCheckpoint \| undefined`                   | Optionnel | Accès domaine optionnel aux descriptions JSON de workspaces ; allocation et snapshots de fichiers restent des responsabilités applicatives.                                                                                    |
| `prices`              | `ModelPriceTable \| undefined`                           | Optionnel | Table de prix du workflow, transmise par les helpers de tâches d’agent. Les dispatchs personnalisés doivent la passer explicitement pour collecter les compteurs par modèle.                                                   |
| `quota`               | `WorkflowQuotaPause \| undefined`                        | Optionnel | Pause sur quota reprise par cette tentative, avec la conversation capturée et la branche conservée lorsqu’elles sont connues ; présente seulement lors de la première tentative après la pause et jamais persistée séparément. |
| `interaction`         | `TaskInteractionContext \| undefined`                    | Optionnel | État durable et opérations de suspension, fournis uniquement aux tâches déclarant une interaction.                                                                                                                             |
| `idempotencyKey`      | `string`                                                 | Requis    | Identité SHA-256 stable de executionId et de la clé de tâche, conservée lors des retries et reprises. À transmettre à un service d’effets avec déduplication persistante.                                                      |
| `observation`         | `ObservationHub \| undefined`                            | Optionnel | Hub de la tâche avec exécution du workflow, clé et tentative ; le transmettre aux opérations imbriquées personnalisées comme speculate.                                                                                        |
| `signal`              | `AbortSignal`                                            | Requis    | Annulé quand le workflow est annulé, s’arrête sur une erreur ou dépasse son délai, ou quand le timeoutMs de cette tentative expire.                                                                                            |
| `attempt`             | `number`                                                 | Requis    | Numéro de tentative à partir de 1, cumulé sur les relances et les reprises de checkpoint ; 0 dans les callbacks condition et clé de cache.                                                                                     |
| `executionId`         | `string`                                                 | Requis    | Identité de l’exécution de workflow, conservée lors de la reprise d’un checkpoint.                                                                                                                                             |
| `reportUsage`         | `(usage: Usage) => void`                                 | Requis    | Ajoute un usage de tokens au budget du workflow ; lève une erreur hors de la tentative active. Les définitions de tâches d’agent signalent elles-mêmes leur usage.                                                             |
| `reportUsageOnce`     | `((receipt: string, usage: Usage) => void) \| undefined` | Optionnel | Ajoute l’usage de tokens seulement si l’identifiant de reçu n’a pas déjà été enregistré, y compris après reprise d’un checkpoint.                                                                                              |
| `checkpoint`          | `(() => Promise<void>) \| undefined`                     | Optionnel | Enregistre immédiatement l’état du workflow ; sans effet sans checkpoint.                                                                                                                                                      |
| `value`               | `<T>(dependency: Task<T>) => T`                          | Requis    | Renvoie la sortie d’une tâche listée dans after ; lève une erreur pour une dépendance non déclarée.                                                                                                                            |

## Signature

```ts
export interface TaskContext {
  readonly workspaceCheckpoint?: TaskWorkspaceCheckpoint;
  readonly prices?: ModelPriceTable;
  /** Quota pause resumed by this attempt; present only on the first attempt after it. */
  readonly quota?: WorkflowQuotaPause;
  readonly interaction?: TaskInteractionContext;
  readonly idempotencyKey: string;
  readonly observation?: ObservationHub;
  readonly signal: AbortSignal;
  readonly attempt: number;
  readonly executionId: string;
  reportUsage(usage: Usage): void;
  reportUsageOnce?(receipt: string, usage: Usage): void;
  checkpoint?(): Promise<void>;
  value<T>(dependency: Task<T>): T;
}
```

## Contrats associés

- [ModelPriceTable](../modelpricetable/)
- [ObservationHub](../observationhub/)
- [Task](../type-task/)
- [TaskInteractionContext](../taskinteractioncontext/)
- [Usage](../usage/)
- [WorkflowQuotaPause](../workflowquotapause/)
