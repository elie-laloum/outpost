---
title: "summarizeHistory"
description: "summarizeHistory — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { summarizeHistory } from "@elie-laloum/outpost/harness";
```

## Rôle et comportement

Crée une stratégie de contexte qui, dès que l’historique sérialisé dépasse triggerCharacters, remplace les anciens messages par un résumé écrit par le modèle et conserve le premier prompt et les messages récents. Chaque résumé est une requête supplémentaire au modèle, comptée dans l’usage et les budgets ; un résumé vide ou interrompu fait échouer le tour avec le code response.

[Exemple complet et règles détaillées](../../guide/harness-context/).

## Paramètres et propriétés

| Nom                          | Type                                   | Présence  | Rôle                                                                                                                                                                                                                 |
| ---------------------------- | -------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                    | `SummarizeHistoryOptions \| undefined` | Optionnel | Taille d’historique qui déclenche un résumé et nombre de messages récents conservés.                                                                                                                                 |
| `options.triggerCharacters`  | `number \| undefined`                  | Optionnel | Longueur de l’historique sérialisé en JSON au-delà de laquelle un résumé est produit, 400000 caractères par défaut. [Texte exact injecté et limites de personnalisation](../summarizehistory/#outpost-instructions). |
| `options.keepRecentMessages` | `number \| undefined`                  | Optionnel | Nombre minimal de messages récents conservés après le résumé, 6 par défaut ; la coupure recule jusqu’au message assistant précédent.                                                                                 |

## Retour

`HarnessContextStrategy`

<span id="outpost-instructions"></span>

## Instructions ajoutées par Outpost

Les templates ci-dessous conservent le texte anglais envoyé au modèle. `${…}` désigne les valeurs insérées à l’exécution, pas la syntaxe des variables d’un brief.

Lorsque la réduction de l’historique se déclenche, Outpost envoie cette instruction système au modèle actif de l’agent dans une requête de résumé distincte :

```text
Summarize this earlier part of an agent conversation for the agent that will continue it. Keep the task, decisions, files and commands involved, results, errors and open questions. Be factual and concise.
```

Le prompt utilisateur contient les anciens messages, séparés par des lignes vides. Chaque message commence par `User:
` ou `Assistant:
`. Les blocs de texte sont conservés ; les appels d’outils deviennent `[tool call ${name} ${inputJSON}]` ; les résultats deviennent `[tool result]
${content}` ou `[tool error]
${content}`. Les blocs de raisonnement sont omis. Une liste de messages vide devient `(no earlier messages)`.

Le résultat est inséré dans l’historique effectif comme message utilisateur, après le premier message et avant les messages récents conservés :

```text
Summary of the earlier conversation:
${summary}
```

L’instruction de résumé et son préfixe sont fixes. `triggerCharacters` et `keepRecentMessages` règlent le déclenchement et la quantité d’historique à résumer. Une [stratégie de contexte personnalisée](../defineharnesscontextstrategy/) peut remplacer le mécanisme, mais appeler `input.summarize()` utilise toujours cette instruction fixe. La requête de résumé intégrée compte dans l’usage et les budgets.

Implémentation : [context.constants.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/domain/context.constants.ts) · [harness-context.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/application/harness-context.ts) · [context.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/domain/context.ts).

## Signature

```ts
export declare function summarizeHistory(
  options?: SummarizeHistoryOptions,
): HarnessContextStrategy;
```

## Contrats associés

- [HarnessContextStrategy](../harnesscontextstrategy/)
- [SummarizeHistoryOptions](../summarizehistoryoptions/)
