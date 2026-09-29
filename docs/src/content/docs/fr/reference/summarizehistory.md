---
title: "summarizeHistory"
description: "summarizeHistory — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { summarizeHistory } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée une stratégie de contexte qui, dès que l’historique sérialisé dépasse triggerCharacters, remplace les anciens messages par un résumé écrit par le modèle et conserve le premier prompt et les messages récents. Chaque résumé est une requête supplémentaire au modèle, comptée dans l’usage et les budgets ; un résumé vide ou interrompu fait échouer le tour avec le code response.

[Exemple complet et règles détaillées](../../guide/harness-context/).

## Paramètres et propriétés

| Nom                          | Type                                   | Présence  | Rôle                                                                                                                                 |
| ---------------------------- | -------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                    | `SummarizeHistoryOptions \| undefined` | Optionnel | Taille d’historique qui déclenche un résumé et nombre de messages récents conservés.                                                 |
| `options.triggerCharacters`  | `number \| undefined`                  | Optionnel | Longueur de l’historique sérialisé en JSON au-delà de laquelle un résumé est produit, 400000 caractères par défaut.                  |
| `options.keepRecentMessages` | `number \| undefined`                  | Optionnel | Nombre minimal de messages récents conservés après le résumé, 6 par défaut ; la coupure recule jusqu’au message assistant précédent. |

## Retour

`HarnessContextStrategy`

## Signature

```ts
export declare function summarizeHistory(
  options?: SummarizeHistoryOptions,
): HarnessContextStrategy;
```

## Contrats associés

- [HarnessContextStrategy](../harnesscontextstrategy/)
- [SummarizeHistoryOptions](../summarizehistoryoptions/)
