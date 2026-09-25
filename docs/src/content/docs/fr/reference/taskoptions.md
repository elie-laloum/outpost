---
title: "TaskOptions"
description: "TaskOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **TaskOptions**. Consultez le [guide workflows](../../guide/workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { TaskOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Composer des tâches avec dépendances explicites et accès typé aux résultats.

Les clés dupliquées, dépendances absentes et cycles échouent à la validation. Une dépendance en échec ou ignorée empêche ses descendants. Les reprises peuvent répéter les effets externes. Unwrap lève une erreur en cas de non-succès.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom         | Type                                                                   | Présence  | Rôle                                                                             |
| ----------- | ---------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `key`       | `string`                                                               | Requis    | Clé stable de tâche ou cache dans le contrat concerné.                           |
| `gate`      | `WorkflowGate \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `perform`   | `(context: TaskContext) => T \| Promise<T>`                            | Requis    | Implémentation de tâche ; respecter son signal d’annulation.                     |
| `condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optionnel | Prédicat évalué avant la première tentative.                                     |
| `retry`     | `Retry \| undefined`                                                   | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                  |
| `timeoutMs` | `number \| undefined`                                                  | Optionnel | Délai en millisecondes pour l’opération concernée.                               |
| `after`     | `readonly Task<unknown>[] \| undefined`                                | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                        |

## Signature

```ts
export type TaskOptions<T> = Omit<Task<T>, "after"> & {
  readonly after?: readonly Task[];
};
```

## Contrats associés

- [Task](../task/)
