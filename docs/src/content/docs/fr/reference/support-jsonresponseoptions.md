---
title: "JsonResponseOptions"
description: "JsonResponseOptions — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

| Nom       | Type                                                            | Présence  | Rôle                                                                           |
| --------- | --------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------ |
| `tag`     | `string`                                                        | Requis    | Identifiant de balise de type XML.                                             |
| `schema`  | `StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Requis    | Validateur de frontière qui précise une entrée inconnue.                       |
| `repairs` | `number \| undefined`                                           | Optionnel | Tentatives supplémentaires de réparation de sortie invalide ; zéro par défaut. |

## Signature

```ts
export type JsonResponseOptions<T> = {
  tag: string;
  schema: StandardValidator<T> | ((input: unknown) => T | Promise<T>);
  repairs?: number;
};
```

## Contrats associés

- [StandardValidator](../standardvalidator/)
