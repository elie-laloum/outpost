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

Erreur levée par WorkflowResult.unwrap() quand status ne vaut pas done. result contient tout le WorkflowResult et cause sa première erreur.

[Exemple complet et règles détaillées](../../guide/task-dependencies/).

## Paramètres et propriétés

| Nom       | Type                  | Présence  | Rôle                                                                                                    |
| --------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| `result`  | `WorkflowResult`      | Requis    | Le WorkflowResult en échec, avec ses enregistrements de tâches, ses erreurs et son usage.               |
| `name`    | `string`              | Requis    | Nom de classe d’erreur permettant de distinguer cet échec des autres erreurs JavaScript.                |
| `message` | `string`              | Requis    | Explication lisible de l’échec.                                                                         |
| `stack`   | `string \| undefined` | Optionnel | Trace de pile JavaScript de l’erreur lorsqu’elle est disponible.                                        |
| `cause`   | `unknown`             | Optionnel | Échec sous-jacent que cette erreur enveloppe ; quotaFault() et unavailableFault() suivent cette chaîne. |

## Signature

```ts
export declare class WorkflowFailure extends Error {
  readonly result: WorkflowResult;
  constructor(result: WorkflowResult);
}
```

## Contrats associés

- [WorkflowResult](../workflowresult/)
