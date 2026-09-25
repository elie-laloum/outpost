---
title: "isolatedTask"
description: "isolatedTask — Outpost API"
sidebar:
  order: 10
---

Contrat public de **isolatedTask**. Consultez le [guide workflows](../../guide/workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { isolatedTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Composer des tâches avec dépendances explicites et accès typé aux résultats.

Les clés dupliquées, dépendances absentes et cycles échouent à la validation. Une dépendance en échec ou ignorée empêche ses descendants. Les reprises peuvent répéter les effets externes. Unwrap lève une erreur en cas de non-succès.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom                 | Type                                                                                  | Présence  | Rôle                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`           | `Omit<TaskOptions<DispatchResult<T>>, "perform"> & IsolatedTaskOptions<T>`            | Requis    | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                               | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                     |
| `options.key`       | `string`                                                                              | Requis    | Clé stable de tâche ou cache dans le contrat concerné.                                        |
| `options.gate`      | `WorkflowGate \| undefined`                                                           | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                | Optionnel | Prédicat évalué avant la première tentative.                                                  |
| `options.retry`     | `Retry \| undefined`                                                                  | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                               |
| `options.timeoutMs` | `number \| undefined`                                                                 | Optionnel | Délai en millisecondes pour l’opération concernée.                                            |
| `options.request`   | `(context: TaskContext) => IsolatedTaskRequest<T> \| Promise<IsolatedTaskRequest<T>>` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |

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
- [Task](../task/)
- [TaskOptions](../taskoptions/)
