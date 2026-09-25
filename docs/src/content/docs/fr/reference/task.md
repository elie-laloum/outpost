---
title: "task"
description: "task — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { task } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit et fige un nœud de workflow dont le callback perform s’exécute après la réussite de ses dépendances. Créer le nœud ne l’exécute pas et n’alloue aucune sandbox. context.value lit les dépendances déclarées ; isolatedTask prend en charge l’allocation d’une sandbox autour d’un dispatch d’agent à la place d’un callback perform personnalisé.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom                 | Type                                                                   | Présence  | Rôle                                                                                                                         |
| ------------------- | ---------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `TaskOptions<T>`                                                       | Requis    | Identité de tâche, dépendances, callback perform et politique de tentatives.                                                 |
| `options.key`       | `string`                                                               | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                         |
| `options.gate`      | `WorkflowGate \| undefined`                                            | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante. |
| `options.perform`   | `(context: TaskContext) => T \| Promise<T>`                            | Requis    | Callback exécuté à chaque tentative ; renvoie sa sortie et doit respecter context.signal.                                    |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optionnel | Prédicat évalué avant la première tentative.                                                                                 |
| `options.retry`     | `Retry \| undefined`                                                   | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                                                              |
| `options.timeoutMs` | `number \| undefined`                                                  | Optionnel | Durée maximale en millisecondes de chaque tentative ; l’annulation est coopérative via context.signal.                       |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                                                    |

## Retour

`Task<T>`

## Signature

```ts
export declare function task<T>(options: TaskOptions<T>): Task<T>;
```

## Contrats associés

- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
