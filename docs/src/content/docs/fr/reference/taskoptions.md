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

| Nom         | Type                                                                   | Présence  | Rôle                                                                                                                         |
| ----------- | ---------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `key`       | `string`                                                               | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                         |
| `gate`      | `WorkflowGate \| undefined`                                            | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante. |
| `perform`   | `(context: TaskContext) => T \| Promise<T>`                            | Requis    | Callback exécuté à chaque tentative ; renvoie sa sortie et doit respecter context.signal.                                    |
| `condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optionnel | Prédicat évalué avant la première tentative.                                                                                 |
| `retry`     | `Retry \| undefined`                                                   | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                                                              |
| `timeoutMs` | `number \| undefined`                                                  | Optionnel | Durée maximale en millisecondes de chaque tentative ; l’annulation est coopérative via context.signal.                       |
| `after`     | `readonly Task<unknown>[] \| undefined`                                | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                                                    |

## Signature

```ts
export type TaskOptions<T> = Omit<Task<T>, "after"> & {
  readonly after?: readonly Task[];
};
```

## Contrats associés

- [Task](../type-task/)
