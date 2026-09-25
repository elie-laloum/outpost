---
title: "response"
description: "response — Outpost API"
sidebar:
  order: 10
---

Contrat public de **response**. Consultez le [guide prompts et réponses](../../guide/agents/responses/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { response } from "@elie-laloum/outpost";
```

## Rôle et comportement

Fournir un brief littéral ou fichier et valider une réponse balisée avant d’exposer sa valeur typée.

Fournissez exactement une forme de brief. L’expansion vaut par défaut 30 secondes par commande originale. Les réparations de réponse valent zéro par défaut. Une réponse structurée exige une passe.

[Exemple complet et règles détaillées](../../guide/agents/responses/).

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
