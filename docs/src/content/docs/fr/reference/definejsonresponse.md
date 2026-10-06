---
title: "defineJsonResponse"
description: "defineJsonResponse — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineJsonResponse } from "@elie-laloum/outpost";
```

## Rôle et comportement

Déclare une réponse JSON avec des consignes automatiques de réponse finale balisée et un JSON Schema d’entrée. Convertit automatiquement l’entrée Standard JSON Schema sauf si jsonSchema est explicite ; un schéma absent, une conversion échouée ou un schéma non conservable sans perte échoue avec le code configuration. Lit la dernière balise complète, accepte les blocs de code JSON et valide avec schema ; un contenu rejeté lève ResponseError.

[Exemple complet et règles détaillées](../../guide/typed-responses/).

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom                  | Type                                                                                     | Présence          | Rôle                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`            | `JsonResponseOptions<T>`                                                                 | Requis            | Balise, validateur, JSON Schema d’entrée si la conversion automatique est indisponible, et tours de réparation autorisés.                                                                                                                                                                                                                                                                                         |
| `options.tag`        | `string`                                                                                 | Requis            | Nom de la balise, sans chevrons : une lettre suivie de lettres, chiffres, _ ou -. Toute autre forme échoue avec le code configuration.                                                                                                                                                                                                                                                                            |
| `options.repairs`    | `number \| undefined`                                                                    | Optionnel         | Tours de correction autorisés après une réponse invalide, 0 par défaut ; entier positif ou nul. Au-dessus de 0, l’agent doit pouvoir reprendre sa conversation.                                                                                                                                                                                                                                                   |
| `options.schema`     | `StandardJsonSchema<T> \| StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Requis            | Validateur Standard Schema ou fonction recevant le JSON analysé comme unknown et renvoyant la valeur typée, éventuellement transformée. Des problèmes signalés ou une erreur levée rejettent la réponse. La conversion automatique du schéma d’entrée exige Standard JSON Schema ; sinon jsonSchema est obligatoire.                                                                                              |
| `options.jsonSchema` | `Readonly<Record<string, unknown>> \| undefined \| Readonly<Record<string, unknown>>`    | Selon la variante | Objet JSON Schema d’entrée explicite inclus dans les consignes automatiques de réponse finale. Obligatoire sauf si schema prend en charge la conversion Standard JSON Schema ; prioritaire sur la conversion. Capturé sous forme de copie JSON sans perte figée en profondeur, sans les métadonnées de protocole ~standard non énumérables ; schema reste le validateur. Aucune référence distante n’est chargée. |

## Retour

`ResponseSpec<T>`

## Signature

```ts
export declare function defineJsonResponse<T>(
  options: JsonResponseOptions<T>,
): ResponseSpec<T>;
```

## Contrats associés

- [JsonResponseOptions](../support-jsonresponseoptions/)
- [ResponseSpec](../responsespec/)
