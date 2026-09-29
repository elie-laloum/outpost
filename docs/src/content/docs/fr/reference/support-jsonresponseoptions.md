---
title: "JsonResponseOptions"
description: "JsonResponseOptions — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

| Nom       | Type                                                            | Présence  | Rôle                                                                                                                                                                                                      |
| --------- | --------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tag`     | `string`                                                        | Requis    | Nom de la balise, sans chevrons : une lettre suivie de lettres, chiffres, _ ou -. Toute autre forme échoue avec le code configuration.                                                                    |
| `schema`  | `StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Requis    | Validateur Standard Schema, par exemple Zod ou Valibot, ou fonction qui reçoit le JSON analysé comme unknown et renvoie la valeur typée. Des problèmes signalés ou une erreur levée rejettent la réponse. |
| `repairs` | `number \| undefined`                                           | Optionnel | Tours de correction autorisés après une réponse invalide, 0 par défaut ; entier positif ou nul. Au-dessus de 0, l’agent doit pouvoir reprendre sa conversation.                                           |

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
