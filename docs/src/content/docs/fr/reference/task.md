---
title: "task"
description: "task — Outpost API"
sidebar:
  order: 10
---

Contrat public de **task**. Consultez le [guide workflows](../../guide/workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { task } from "@elie-laloum/outpost";
```

## Rôle et comportement

Composer des tâches avec dépendances explicites et accès typé aux résultats.

Les clés dupliquées, dépendances absentes et cycles échouent à la validation. Une dépendance en échec ou ignorée empêche ses descendants. Les reprises peuvent répéter les effets externes. Unwrap lève une erreur en cas de non-succès.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom                 | Type                                                                   | Présence  | Rôle                                                                                          |
| ------------------- | ---------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`           | `TaskOptions<T>`                                                       | Requis    | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.key`       | `string`                                                               | Requis    | Clé stable de tâche ou cache dans le contrat concerné.                                        |
| `options.gate`      | `WorkflowGate \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.perform`   | `(context: TaskContext) => T \| Promise<T>`                            | Requis    | Implémentation de tâche ; respecter son signal d’annulation.                                  |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optionnel | Prédicat évalué avant la première tentative.                                                  |
| `options.retry`     | `Retry \| undefined`                                                   | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                               |
| `options.timeoutMs` | `number \| undefined`                                                  | Optionnel | Délai en millisecondes pour l’opération concernée.                                            |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                     |

## Retour

`Task<T>`

## Signature

```ts
export declare function task<T>(options: TaskOptions<T>): Task<T>;
```

## Contrats associés

- [Task](../task/)
- [TaskOptions](../taskoptions/)
