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

| Nom         | Type                                                                   | Présence  | Rôle                                                                                                                         |
| ----------- | ---------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `key`       | `string`                                                               | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                         |
| `gate`      | `WorkflowGate \| undefined`                                            | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante. |
| `after`     | `readonly Task<unknown>[]`                                             | Requis    | Dépendances déclarées dont les valeurs peuvent être lues.                                                                    |
| `perform`   | `(context: TaskContext) => T \| Promise<T>`                            | Requis    | Callback exécuté à chaque tentative ; renvoie sa sortie et doit respecter context.signal.                                    |
| `condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optionnel | Prédicat évalué avant la première tentative.                                                                                 |
| `retry`     | `Retry \| undefined`                                                   | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                                                              |
| `timeoutMs` | `number \| undefined`                                                  | Optionnel | Durée maximale en millisecondes de chaque tentative ; l’annulation est coopérative via context.signal.                       |

## Signature

```ts
export interface Task<T = unknown> {
  readonly key: string;
  readonly gate?: WorkflowGate;
  readonly after: readonly Task[];
  readonly perform: (context: TaskContext) => T | Promise<T>;
  readonly condition?: (context: TaskContext) => boolean | Promise<boolean>;
  readonly retry?: Retry;
  readonly timeoutMs?: number;
}
```

## Contrats associés

- [Retry](../retry/)
- [TaskContext](../taskcontext/)
- [WorkflowGate](../workflowgate/)
