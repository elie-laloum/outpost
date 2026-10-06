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

Déclare une réponse textuelle avec des consignes automatiques de réponse finale balisée. Renvoie le contenu nettoyé de la dernière paire de balises complète ; des balises absentes lèvent ResponseError. Une balise ou un nombre de réparations invalide échoue avec le code configuration.

[Exemple complet et règles détaillées](../../guide/typed-responses/).

## Paramètres et propriétés

| Nom               | Type                  | Présence  | Rôle                                                                                                                                                            |
| ----------------- | --------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `TextResponseOptions` | Requis    | Balise utilisée par les consignes automatiques de réponse finale et tours de réparation autorisés.                                                              |
| `options.tag`     | `string`              | Requis    | Nom de la balise, sans chevrons : une lettre suivie de lettres, chiffres, _ ou -. Toute autre forme échoue avec le code configuration.                          |
| `options.repairs` | `number \| undefined` | Optionnel | Tours de correction autorisés après une réponse invalide, 0 par défaut ; entier positif ou nul. Au-dessus de 0, l’agent doit pouvoir reprendre sa conversation. |

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
