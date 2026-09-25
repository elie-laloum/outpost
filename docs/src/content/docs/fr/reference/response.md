---
title: "response"
description: "response — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { response } from "@elie-laloum/outpost";
```

## Rôle et comportement

Construit des validateurs de réponse balisée avec text ou json. Tous deux lisent la dernière balise complète correspondante ; json analyse son contenu et applique le schéma fourni. Un contenu absent ou invalide lève ResponseError, et repairs vaut zéro par défaut.

[Exemple complet et règles détaillées](../../guide/agents/responses/).

## Paramètres et propriétés

| Nom    | Type                                                      | Présence | Rôle                                                                                                                    |
| ------ | --------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `text` | `(options: TextResponseOptions) => ResponseSpec<string>`  | Requis   | Construit un validateur renvoyant le contenu nettoyé de la dernière balise complète sous forme de chaîne.               |
| `json` | `<T>(options: JsonResponseOptions<T>) => ResponseSpec<T>` | Requis   | Construit un validateur analysant le JSON balisé et appliquant un validateur Standard Schema ou une fonction d’analyse. |

## Signature

```ts
export declare const response: {
  text: (options: TextResponseOptions) => ResponseSpec<string>;
  json: <T>(options: JsonResponseOptions<T>) => ResponseSpec<T>;
};
```

## Contrats associés

- [JsonResponseOptions](../support-jsonresponseoptions/)
- [ResponseSpec](../responsespec/)
- [TextResponseOptions](../support-textresponseoptions/)
