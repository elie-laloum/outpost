---
title: "TaskContext"
description: "TaskContext — Outpost API"
sidebar:
  order: 10
---

Contrat public de **TaskContext**. Consultez le [guide workflows](../../guide/workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { TaskContext } from "@elie-laloum/outpost";
```

## Rôle et comportement

Composer des tâches avec dépendances explicites et accès typé aux résultats.

Les clés dupliquées, dépendances absentes et cycles échouent à la validation. Une dépendance en échec ou ignorée empêche ses descendants. Les reprises peuvent répéter les effets externes. Unwrap lève une erreur en cas de non-succès.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom               | Type                                                     | Présence  | Rôle                                                                             |
| ----------------- | -------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `signal`          | `AbortSignal`                                            | Requis    | Annulation coopérative de cette opération.                                       |
| `attempt`         | `number`                                                 | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `executionId`     | `string`                                                 | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `reportUsage`     | `(usage: Usage) => void`                                 | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `reportUsageOnce` | `((receipt: string, usage: Usage) => void) \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `checkpoint`      | `(() => Promise<void>) \| undefined`                     | Optionnel | Stockage durable de l’exécution et configuration de rejeu.                       |
| `value`           | `<T>(dependency: Task<T>) => T`                          | Requis    | Valeur typée produite ou consommée par ce contrat.                               |

## Signature

```ts
export interface TaskContext {
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

- [Task](../task/)
- [Usage](../usage/)
