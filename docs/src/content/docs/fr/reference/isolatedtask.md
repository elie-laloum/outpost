---
title: "isolatedTask"
description: "isolatedTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { isolatedTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit un nœud d’agent dont le callback request choisit le dépôt, le provider, l’agent et les options de dispatch à chaque tentative. Il appelle dispatch pour allouer et fermer sa propre sandbox et renvoie DispatchResult. Des nœuds distincts peuvent traiter des dépôts distincts ; aucune transaction Git commune ni aucun push automatique ne les relie.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom                 | Type                                                                                  | Présence  | Rôle                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `Omit<TaskOptions<DispatchResult<T>>, "perform"> & IsolatedTaskOptions<T>`            | Requis    | Réglages d’ordonnancement et fabrique de requêtes choisissant un dépôt et une sandbox distincts à chaque tentative.          |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                               | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                                                    |
| `options.key`       | `string`                                                                              | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                         |
| `options.gate`      | `WorkflowGate \| undefined`                                                           | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante. |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                | Optionnel | Prédicat évalué avant la première tentative.                                                                                 |
| `options.retry`     | `Retry \| undefined`                                                                  | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                                                              |
| `options.timeoutMs` | `number \| undefined`                                                                 | Optionnel | Durée maximale en millisecondes de chaque tentative ; l’annulation est coopérative via context.signal.                       |
| `options.request`   | `(context: TaskContext) => IsolatedTaskRequest<T> \| Promise<IsolatedTaskRequest<T>>` | Requis    | Construit les options de dépôt, provider, agent et brief pour un dispatch alloué séparément à chaque tentative.              |

## Retour

`Task<DispatchResult<T>>`

## Signature

```ts
export declare function isolatedTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform"> &
    IsolatedTaskOptions<T>,
): Task<DispatchResult<T>>;
```

## Contrats associés

- [DispatchResult](../dispatchresult/)
- [IsolatedTaskOptions](../support-isolatedtaskoptions/)
- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
