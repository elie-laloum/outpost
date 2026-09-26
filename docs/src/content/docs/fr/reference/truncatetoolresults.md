---
title: "truncateToolResults"
description: "truncateToolResults — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Le streaming n’est pas encore disponible ; le contrat peut changer avant publication.
:::

## Import

```ts
import { truncateToolResults } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée une stratégie de contexte qui raccourcit les résultats des anciens appels d’outils et laisse intacts les plus récents. Elle ne change rien tant qu’aucun ancien résultat ne dépasse la limite.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Paramètres et propriétés

| Nom                     | Type                                      | Présence  | Rôle                                                                                                        |
| ----------------------- | ----------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| `options`               | `TruncateToolResultsOptions \| undefined` | Optionnel | Nombre de résultats d’outils récents conservés intacts et longueur à laquelle les plus anciens sont coupés. |
| `options.keepRecent`    | `number \| undefined`                     | Optionnel | Nombre de messages de résultats d’outils les plus récents conservés intacts ; 4 par défaut.                 |
| `options.maxCharacters` | `number \| undefined`                     | Optionnel | Longueur à laquelle les anciens résultats d’outils sont coupés ; 2 000 caractères par défaut.               |

## Retour

`HarnessContextStrategy`

## Signature

```ts
export declare function truncateToolResults(
  options?: TruncateToolResultsOptions,
): HarnessContextStrategy;
```

## Contrats associés

- [HarnessContextStrategy](../harnesscontextstrategy/)
- [TruncateToolResultsOptions](../truncatetoolresultsoptions/)
