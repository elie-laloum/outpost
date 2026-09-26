---
title: "summarizeHistory"
description: "summarizeHistory — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Le streaming n’est pas encore disponible ; le contrat peut changer avant publication.
:::

## Import

```ts
import { summarizeHistory } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée une stratégie de contexte qui, quand l’historique dépasse une taille, demande au modèle de résumer la partie ancienne et conserve le premier prompt et les messages récents. Chaque résumé coûte une requête de plus.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Paramètres et propriétés

| Nom                          | Type                                   | Présence  | Rôle                                                                                      |
| ---------------------------- | -------------------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `options`                    | `SummarizeHistoryOptions \| undefined` | Optionnel | Taille d’historique qui déclenche un résumé et nombre de messages récents conservés.      |
| `options.triggerCharacters`  | `number \| undefined`                  | Optionnel | Taille de l’historique sérialisé qui déclenche un résumé ; 400 000 caractères par défaut. |
| `options.keepRecentMessages` | `number \| undefined`                  | Optionnel | Nombre de messages récents conservés après le résumé ; 6 par défaut.                      |

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
