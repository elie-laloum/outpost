---
title: "TextResponseOptions"
description: "TextResponseOptions — Outpost API"
sidebar:
  order: 10
---

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
