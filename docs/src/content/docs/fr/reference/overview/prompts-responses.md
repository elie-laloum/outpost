---
title: "Prompts et réponses — Vue d’ensemble"
description: "Le brief dit à l’agent quoi faire ; le contrat de réponse transforme sa réponse balisée en valeur validée."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Formes de brief

Un brief texte est envoyé tel quel. Un brief fichier est un modèle qu’Outpost lit et développe avant chaque passe.

| Forme         | Écriture                         | Ce que fait Outpost                                                                                                         | Échec                                                                          |
| ------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Brief texte   | `{ text }`                       | Envoie le texte sans modification                                                                                           | `values` fourni : code `configuration`                                         |
| Brief fichier | `{ file, values }`               | Lit le fichier, résolu depuis le répertoire de travail du processus                                                         | Un fichier illisible rejette le dispatch                                       |
| Variable      | `{{NAME}}` dans le fichier       | La remplace par `values.NAME` ou par les variables réservées `WORK_BRANCH` / `BASE_BRANCH`                                  | Valeur absente : code `prompt` ; valeur inutilisée : callback `warn`           |
| Commande      | `` !`command` `` dans le fichier | L’exécute dans la sandbox avec `sh -c`, toutes les commandes en parallèle, et insère sa sortie standard sans espaces finaux | Sortie non nulle : code `prompt` ; au-delà d’`expansionMs` (30000) : `timeout` |

:::caution
Les variables placées dans une commande sont insérées sans échappement. N’y passez que des `values` de confiance.
:::

## Réponse texte ou JSON

Les deux contrats lisent la dernière paire `<tag>…</tag>` complète du dernier tour et renvoient le résultat dans `value`.

|                    | `defineTextResponse()`                     | `defineJsonResponse()`                                                                                  |
| ------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `value`            | Texte de la balise, sans espaces aux bords | Sortie de `schema`, typée d’après lui                                                                   |
| Contenu accepté    | Tout texte                                 | Du JSON, éventuellement dans un bloc de code Markdown                                                   |
| `ResponseError` si | Aucune balise complète                     | Aucune balise complète, JSON invalide, problèmes signalés par le schéma ou erreur levée par la fonction |

- **Avant le démarrage de la sandbox** : le brief doit contenir `<tag>`, et `repairs` supérieur à 0 exige un agent capable de reprendre sa conversation ; sinon code `configuration`. `passes` doit valoir 1.
- **Réponse invalide** : chaque tour de réparation reprend la même conversation avec l’erreur de validation et ne demande que la balise corrigée.
- **Plus de réparation disponible** : `dispatch()` lève `ResponseError` avec le code `response` ; `raw` contient le contenu rejeté et `recovery` indique la conversation, la branche, le répertoire et les tours.

## Points d’entrée

Guide : [Réponses typées](../../../guide/typed-responses/) · [Rédiger le brief](../../../guide/briefs/)

- [defineTextResponse](../../definetextresponse/)
- [defineJsonResponse](../../definejsonresponse/)
- [Brief](../../brief/)
- [PromptVariables](../../promptvariables/)
- [ResponseSpec](../../responsespec/)
- [StandardValidator](../../standardvalidator/)
- [ResponseError](../../responseerror/)
