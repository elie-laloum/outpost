---
title: "defineTextResponse"
description: "defineTextResponse — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineTextResponse } from "@elie-laloum/outpost";
```

## Rôle et comportement

Déclare une réponse texte balisée. Le validateur lit la dernière balise complète correspondante et renvoie son contenu nettoyé sous forme de chaîne. Un contenu absent ou invalide lève ResponseError ; repairs vaut zéro par défaut.

[Exemple complet et règles détaillées](../../guide/typed-responses/).

## Paramètres et propriétés

| Nom               | Type                  | Présence  | Rôle                                                                                                                   |
| ----------------- | --------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `options`         | `TextResponseOptions` | Requis    | Balise de réponse, un identifiant de style XML, et nombre de tours de réparation autorisés après une réponse invalide. |
| `options.tag`     | `string`              | Requis    | Identifiant de balise de type XML.                                                                                     |
| `options.repairs` | `number \| undefined` | Optionnel | Tentatives supplémentaires de réparation de sortie invalide ; zéro par défaut.                                         |

## Retour

`ResponseSpec<string>`

## Signature

```ts
export declare function defineTextResponse(
  options: TextResponseOptions,
): ResponseSpec<string>;
```

## Contrats associés

- [ResponseSpec](../responsespec/)
- [TextResponseOptions](../support-textresponseoptions/)
