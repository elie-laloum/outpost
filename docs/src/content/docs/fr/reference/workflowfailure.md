---
title: "WorkflowFailure"
description: "WorkflowFailure — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowFailure**. Consultez le [guide workflows](../../guide/workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { WorkflowFailure } from "@elie-laloum/outpost";
```

## Rôle et comportement

Composer des tâches avec dépendances explicites et accès typé aux résultats.

Les clés dupliquées, dépendances absentes et cycles échouent à la validation. Une dépendance en échec ou ignorée empêche ses descendants. Les reprises peuvent répéter les effets externes. Unwrap lève une erreur en cas de non-succès.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom       | Type                  | Présence  | Rôle                                                                             |
| --------- | --------------------- | --------- | -------------------------------------------------------------------------------- |
| `result`  | `WorkflowResult`      | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `name`    | `string`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `message` | `string`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `stack`   | `string \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `cause`   | `unknown`             | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export declare class WorkflowFailure extends Error {
  readonly result: WorkflowResult;
  constructor(result: WorkflowResult);
}
```

## Contrats associés

- [WorkflowResult](../workflowresult/)
