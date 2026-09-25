---
title: "TextResponseOptions"
description: "TextResponseOptions — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Fournir un brief littéral ou fichier et valider une réponse balisée avant d’exposer sa valeur typée.

Fournissez exactement une forme de brief. L’expansion vaut par défaut 30 secondes par commande originale. Les réparations de réponse valent zéro par défaut. Une réponse structurée exige une passe.

[Exemple complet et règles détaillées](../../guide/agents/responses/).

## Paramètres et propriétés

| Nom       | Type                  | Présence  | Rôle                                                                           |
| --------- | --------------------- | --------- | ------------------------------------------------------------------------------ |
| `tag`     | `string`              | Requis    | Identifiant de balise de type XML.                                             |
| `repairs` | `number \| undefined` | Optionnel | Tentatives supplémentaires de réparation de sortie invalide ; zéro par défaut. |

## Signature

```ts
export type TextResponseOptions = {
  tag: string;
  repairs?: number;
};
```
