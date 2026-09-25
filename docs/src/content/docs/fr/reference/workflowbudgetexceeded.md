---
title: "WorkflowBudgetExceeded"
description: "WorkflowBudgetExceeded — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { WorkflowBudgetExceeded } from "@elie-laloum/outpost";
```

## Rôle et comportement

Erreur identifiant la dimension de tentatives ou de tokens dont la limite d’admission a été atteinte. limit et observed exposent seuil et comptabilité courante ; l’usage observé ne constitue pas un plafond de facturation.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom         | Type                        | Présence  | Rôle                                                                                              |
| ----------- | --------------------------- | --------- | ------------------------------------------------------------------------------------------------- |
| `dimension` | `"attempts" \| keyof Usage` | Requis    | Dimension du budget dont la limite d’admission a été dépassée : tentatives ou compteur de tokens. |
| `limit`     | `number`                    | Requis    | Seuil d’admission configuré pour la dimension de budget dépassée.                                 |
| `observed`  | `number`                    | Requis    | Quantité cumulée courante observée pour la dimension de budget dépassée.                          |
| `name`      | `string`                    | Requis    | Nom de classe d’erreur permettant de distinguer cet échec des autres erreurs JavaScript.          |
| `message`   | `string`                    | Requis    | Explication lisible de l’échec.                                                                   |
| `stack`     | `string \| undefined`       | Optionnel | Trace de pile JavaScript de l’erreur lorsqu’elle est disponible.                                  |
| `cause`     | `unknown`                   | Optionnel | Échec d’origine attaché à cette erreur.                                                           |

## Signature

```ts
export declare class WorkflowBudgetExceeded extends Error {
  readonly dimension: "attempts" | keyof Usage;
  readonly limit: number;
  readonly observed: number;
  constructor(
    dimension: "attempts" | keyof Usage,
    limit: number,
    observed: number,
  );
}
```

## Contrats associés

- [Usage](../usage/)
