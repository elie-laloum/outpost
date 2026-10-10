---
title: "WorkflowCostUnavailable"
description: "WorkflowCostUnavailable — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { WorkflowCostUnavailable } from "@elie-laloum/outpost";
```

## Rôle et comportement

Levée lorsqu’un budget de coût ne peut mesurer chaque token rapporté faute d’usage, de modèle identifié ou de tarif correspondant. Arrête les tentatives actives même avec une limite de tentatives ; le terminationCode du workflow est usage-unavailable.

[Exemple complet et règles détaillées](../../guide/estimating-costs/).

## Paramètres et propriétés

| Nom         | Type                  | Présence  | Rôle                                                                                                    |
| ----------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| `dimension` | `"cost"`              | Requis    | Toujours cost, identifiant une comptabilisation monétaire indisponible.                                 |
| `name`      | `string`              | Requis    | Nom de classe d’erreur permettant de distinguer cet échec des autres erreurs JavaScript.                |
| `message`   | `string`              | Requis    | Explication lisible de l’échec.                                                                         |
| `stack`     | `string \| undefined` | Optionnel | Trace de pile JavaScript de l’erreur lorsqu’elle est disponible.                                        |
| `cause`     | `unknown`             | Optionnel | Échec sous-jacent que cette erreur enveloppe ; quotaFault() et unavailableFault() suivent cette chaîne. |

## Signature

```ts
export declare class WorkflowCostUnavailable extends Error {
  readonly dimension = "cost";
  constructor();
}
```
