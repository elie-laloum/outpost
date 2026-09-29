---
title: "Task"
description: "Task — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Task } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                                                   | Présence  | Rôle                                                                                                                                                                                                                                                                                                             |
| ------------- | ---------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `interaction` | `TaskInteraction \| undefined`                                         | Optionnel | Contrat optionnel de saisie humaine durable ; exige un checkpoint et ne peut pas être combiné avec une gate.                                                                                                                                                                                                     |
| `key`         | `string`                                                               | Requis    | Clé unique dans le workflow, conforme à [A-Za-z0-9][A-Za-z0-9._-]*. Les enregistrements, événements et checkpoints identifient la tâche par elle.                                                                                                                                                                |
| `gate`        | `WorkflowGate \| undefined`                                            | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante.                                                                                                                                                                                     |
| `after`       | `readonly Task<unknown>[]`                                             | Requis    | Tâches qui doivent être done avant que celle-ci démarre ; seules celles-ci se lisent avec context.value(). Une dépendance failed, skipped, cancelled ou rejected fait passer cette tâche en skipped.                                                                                                             |
| `perform`     | `(context: TaskContext) => T \| Promise<T>`                            | Requis    | S’exécute à chaque tentative et renvoie la sortie de la tâche ; avec un checkpoint, cette sortie doit être du JSON sans perte ou undefined. Arrêtez le travail quand context.signal est annulé.                                                                                                                  |
| `condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optionnel | Évaluée avec attempt 0 avant l’exécution de la tâche, y compris quand un start() ultérieur la reprend ; false termine la tâche en skipped, ce qui ignore aussi ses dépendantes.                                                                                                                                  |
| `retry`       | `Retry \| undefined`                                                   | Optionnel | Politique de relance des tentatives échouées ; sans elle, la tâche s’exécute une fois. Une tentative relancée répète ses effets de bord.                                                                                                                                                                         |
| `timeoutMs`   | `number \| undefined`                                                  | Optionnel | Délai en millisecondes de chaque tentative, entier positif jusqu’à 2147483647. À l’expiration, context.signal est annulé et la tentative échoue ; retry peut la répéter.                                                                                                                                         |
| `cache`       | `TaskCacheOptions \| undefined`                                        | Optionnel | Cache de résultat : une entrée trouvée restaure la valeur JSON sans perte enregistrée, sans tentative, usage ni effet de bord. En cas d’absence, un résultat qui n’est pas du JSON sans perte fait échouer la tâche. Refusé sur les gates, les interactions et les tâches qui renvoient un résultat de dispatch. |

## Signature

```ts
export interface Task<T = unknown> {
  readonly interaction?: TaskInteraction;
  readonly key: string;
  readonly gate?: WorkflowGate;
  readonly after: readonly Task[];
  readonly perform: (context: TaskContext) => T | Promise<T>;
  readonly condition?: (context: TaskContext) => boolean | Promise<boolean>;
  readonly retry?: Retry;
  readonly timeoutMs?: number;
  readonly cache?: TaskCacheOptions;
}
```

## Contrats associés

- [Retry](../retry/)
- [TaskCacheOptions](../taskcacheoptions/)
- [TaskContext](../taskcontext/)
- [TaskInteraction](../taskinteraction/)
- [WorkflowGate](../workflowgate/)
