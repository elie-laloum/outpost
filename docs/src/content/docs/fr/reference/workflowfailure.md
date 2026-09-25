---
title: "WorkflowFailure"
description: "WorkflowFailure — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { WorkflowFailure } from "@elie-laloum/outpost";
```

## Rôle et comportement

Erreur levée par WorkflowResult.unwrap quand l’exécution n’a pas réussi. result conserve les états des tâches, erreurs et usage pour permettre leur inspection.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom       | Type                  | Présence  | Rôle                                                                                       |
| --------- | --------------------- | --------- | ------------------------------------------------------------------------------------------ |
| `result`  | `WorkflowResult`      | Requis    | Résultat complet du workflow non réussi, conservé pour inspecter tâches, erreurs et usage. |
| `name`    | `string`              | Requis    | Nom de classe d’erreur permettant de distinguer cet échec des autres erreurs JavaScript.   |
| `message` | `string`              | Requis    | Explication lisible de l’échec.                                                            |
| `stack`   | `string \| undefined` | Optionnel | Trace de pile JavaScript de l’erreur lorsqu’elle est disponible.                           |
| `cause`   | `unknown`             | Optionnel | Échec d’origine attaché à cette erreur.                                                    |

## Signature

```ts
export declare class WorkflowFailure extends Error {
  readonly result: WorkflowResult;
  constructor(result: WorkflowResult);
}
```

## Contrats associés

- [WorkflowResult](../workflowresult/)
