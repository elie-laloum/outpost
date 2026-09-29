---
title: "TextResponseOptions"
description: "TextResponseOptions — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

| Nom       | Type                  | Présence  | Rôle                                                                                                                                                            |
| --------- | --------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tag`     | `string`              | Requis    | Nom de la balise, sans chevrons : une lettre suivie de lettres, chiffres, _ ou -. Toute autre forme échoue avec le code configuration.                          |
| `repairs` | `number \| undefined` | Optionnel | Tours de correction autorisés après une réponse invalide, 0 par défaut ; entier positif ou nul. Au-dessus de 0, l’agent doit pouvoir reprendre sa conversation. |

## Signature

```ts
export type TextResponseOptions = {
  tag: string;
  repairs?: number;
};
```
