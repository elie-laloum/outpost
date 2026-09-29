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

Déclare une réponse lue dans la dernière paire &lt;tag>…&lt;/tag> complète, analysée comme du JSON, éventuellement dans un bloc de code Markdown, puis vérifiée par schema. Une balise absente, un JSON invalide, des problèmes signalés par le schéma ou une erreur levée par la fonction échouent avec ResponseError ; un tag ou un repairs invalide échoue avec le code configuration.

[Exemple complet et règles détaillées](../../guide/typed-responses/).

## Paramètres et propriétés

| Nom               | Type                                                            | Présence  | Rôle                                                                                                                                                                                                      |
| ----------------- | --------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `JsonResponseOptions<T>`                                        | Requis    | Nom de la balise, schéma ou fonction d’analyse, et nombre de tours de réparation autorisés après une réponse invalide.                                                                                    |
| `options.tag`     | `string`                                                        | Requis    | Nom de la balise, sans chevrons : une lettre suivie de lettres, chiffres, _ ou -. Toute autre forme échoue avec le code configuration.                                                                    |
| `options.schema`  | `StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Requis    | Validateur Standard Schema, par exemple Zod ou Valibot, ou fonction qui reçoit le JSON analysé comme unknown et renvoie la valeur typée. Des problèmes signalés ou une erreur levée rejettent la réponse. |
| `options.repairs` | `number \| undefined`                                           | Optionnel | Tours de correction autorisés après une réponse invalide, 0 par défaut ; entier positif ou nul. Au-dessus de 0, l’agent doit pouvoir reprendre sa conversation.                                           |

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
