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

Erreur enregistrée dans WorkflowResult.errors quand une limite du budget est atteinte, ce qui fait échouer l’exécution. Une limite attempts annule les tâches non démarrées ; une limite de tokens annule aussi les tâches en cours.

[Exemple complet et règles détaillées](../../guide/budgets/).

## Paramètres et propriétés

| Nom         | Type                                                              | Présence  | Rôle                                                                                                    |
| ----------- | ----------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| `dimension` | `"input" \| "cached" \| "cacheCreated" \| "output" \| "attempts"` | Requis    | Dimension du budget dont la limite d’admission a été dépassée : tentatives ou compteur de tokens.       |
| `limit`     | `number`                                                          | Requis    | Seuil d’admission configuré pour la dimension de budget dépassée.                                       |
| `observed`  | `number`                                                          | Requis    | Quantité cumulée courante observée pour la dimension de budget dépassée.                                |
| `name`      | `string`                                                          | Requis    | Nom de classe d’erreur permettant de distinguer cet échec des autres erreurs JavaScript.                |
| `message`   | `string`                                                          | Requis    | Explication lisible de l’échec.                                                                         |
| `stack`     | `string \| undefined`                                             | Optionnel | Trace de pile JavaScript de l’erreur lorsqu’elle est disponible.                                        |
| `cause`     | `unknown`                                                         | Optionnel | Échec sous-jacent que cette erreur enveloppe ; quotaFault() et unavailableFault() suivent cette chaîne. |

## Signature

```ts
export declare class WorkflowBudgetExceeded extends Error {
  readonly dimension: "attempts" | Exclude<keyof Usage, "complete">;
  readonly limit: number;
  readonly observed: number;
  constructor(
    dimension: "attempts" | Exclude<keyof Usage, "complete">,
    limit: number,
    observed: number,
  );
}
```

## Contrats associés

- [Usage](../usage/)
