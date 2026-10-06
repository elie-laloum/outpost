---
title: "TaskOptions"
description: "TaskOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { TaskOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                                                   | Présence  | Rôle                                                                                                                                                                                                                                                                                                             |
| ------------- | ---------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retry`       | `Retry \| undefined`                                                   | Optionnel | Politique de relance des tentatives échouées ; sans elle, la tâche s’exécute une fois. Une tentative relancée répète ses effets de bord.                                                                                                                                                                         |
| `cache`       | `TaskCacheOptions \| undefined`                                        | Optionnel | Cache de résultat : une entrée trouvée restaure la valeur JSON sans perte enregistrée, sans tentative, usage ni effet de bord. En cas d’absence, un résultat qui n’est pas du JSON sans perte fait échouer la tâche. Refusé sur les gates, les interactions et les tâches qui renvoient un résultat de dispatch. |
| `gate`        | `WorkflowGate \| undefined`                                            | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante.                                                                                                                                                                                     |
| `key`         | `string`                                                               | Requis    | Clé unique dans le workflow, conforme à [A-Za-z0-9][A-Za-z0-9._-]*. Les enregistrements, événements et checkpoints identifient la tâche par elle.                                                                                                                                                                |
| `interaction` | `TaskInteraction \| undefined`                                         | Optionnel | Contrat optionnel de saisie humaine durable ; exige un checkpoint et ne peut pas être combiné avec une gate.                                                                                                                                                                                                     |
| `perform`     | `(context: TaskContext) => T \| Promise<T>`                            | Requis    | S’exécute à chaque tentative et renvoie la sortie de la tâche ; avec un checkpoint, cette sortie doit être du JSON sans perte ou undefined. Arrêtez le travail quand context.signal est annulé.                                                                                                                  |
| `condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optionnel | Évaluée avec attempt 0 avant l’exécution de la tâche, y compris quand un start() ultérieur la reprend ; false termine la tâche en skipped, ce qui ignore aussi ses dépendantes.                                                                                                                                  |
| `timeoutMs`   | `number \| undefined`                                                  | Optionnel | Délai en millisecondes de chaque tentative, entier positif jusqu’à 2147483647. À l’expiration, context.signal est annulé et la tentative échoue ; retry peut la répéter.                                                                                                                                         |
| `after`       | `readonly Task<unknown>[] \| undefined`                                | Optionnel | Tâches qui doivent être done avant que celle-ci démarre, aucune par défaut ; seules celles-ci se lisent avec context.value().                                                                                                                                                                                    |

## Signature

```ts
export type TaskOptions<T> = Omit<Task<T>, "after"> & {
  readonly after?: readonly Task[];
};
```

## Contrats associés

- [Task](../type-task/)
