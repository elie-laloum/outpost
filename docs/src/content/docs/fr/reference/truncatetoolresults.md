---
title: "truncateToolResults"
description: "truncateToolResults — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { truncateToolResults } from "@elie-laloum/outpost/harness";
```

## Rôle et comportement

Crée une stratégie de contexte qui coupe les anciens résultats d’outils à maxCharacters en ajoutant un marqueur de troncature, et laisse intacts les keepRecent messages de résultats d’outils les plus récents. Elle ne renvoie rien tant qu’aucun ancien résultat ne dépasse la limite.

[Exemple complet et règles détaillées](../../guide/harness-context/).

## Paramètres et propriétés

| Nom                     | Type                                      | Présence  | Rôle                                                                                                        |
| ----------------------- | ----------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| `options`               | `TruncateToolResultsOptions \| undefined` | Optionnel | Nombre de résultats d’outils récents conservés intacts et longueur à laquelle les plus anciens sont coupés. |
| `options.keepRecent`    | `number \| undefined`                     | Optionnel | Nombre de messages de résultats d’outils les plus récents laissés intacts, 4 par défaut.                    |
| `options.maxCharacters` | `number \| undefined`                     | Optionnel | Longueur à laquelle les anciens résultats d’outils sont coupés, 2000 caractères par défaut.                 |

## Retour

`HarnessContextStrategy`

<span id="outpost-instructions"></span>

## Instructions ajoutées par Outpost

Les templates ci-dessous conservent le texte anglais envoyé au modèle. `${…}` désigne les valeurs insérées à l’exécution, pas la syntaxe des variables d’un brief.

Quand un ancien résultat d’outil dépasse `maxCharacters`, son contenu est remplacé par :

```text
${retainedContent}
[earlier output truncated from ${originalLength} characters]
```

`retainedContent` contient les `maxCharacters` premières unités de code de la chaîne JavaScript ; `originalLength` est la propriété `length` de la chaîne initiale. Ce marqueur appartient au résultat d’outil et ne déclenche aucun appel au modèle. Sa formulation est fixe. Modifiez `maxCharacters` ou `keepRecent` pour régler la troncature, ou fournissez une stratégie de contexte personnalisée pour appliquer une autre transformation.

Implémentation : [context.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/domain/context.ts).

## Signature

```ts
export declare function truncateToolResults(
  options?: TruncateToolResultsOptions,
): HarnessContextStrategy;
```

## Contrats associés

- [HarnessContextStrategy](../harnesscontextstrategy/)
- [TruncateToolResultsOptions](../truncatetoolresultsoptions/)
