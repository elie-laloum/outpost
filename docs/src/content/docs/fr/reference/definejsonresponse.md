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

Déclare une réponse JSON balisée. Le validateur lit la dernière balise complète correspondante, accepte un bloc de code json optionnel, analyse le contenu et applique le validateur Standard Schema ou la fonction d’analyse. Un contenu absent ou invalide lève ResponseError ; repairs vaut zéro par défaut.

[Exemple complet et règles détaillées](../../guide/agents/responses/).

## Paramètres et propriétés

| Nom               | Type                                                            | Présence  | Rôle                                                                                                                         |
| ----------------- | --------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `JsonResponseOptions<T>`                                        | Requis    | Balise de réponse, schéma JSON ou fonction d’analyse, et nombre de tours de réparation autorisés après une réponse invalide. |
| `options.tag`     | `string`                                                        | Requis    | Identifiant de balise de type XML.                                                                                           |
| `options.schema`  | `StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Requis    | Validateur de frontière qui précise une entrée inconnue.                                                                     |
| `options.repairs` | `number \| undefined`                                           | Optionnel | Tentatives supplémentaires de réparation de sortie invalide ; zéro par défaut.                                               |

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
