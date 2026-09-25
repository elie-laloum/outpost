---
title: "ResponseSpec"
description: "ResponseSpec — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ResponseSpec } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                           | Présence | Rôle                                                                                                     |
| --------- | ------------------------------ | -------- | -------------------------------------------------------------------------------------------------------- |
| `tag`     | `string`                       | Requis   | Identifiant de balise de type XML.                                                                       |
| `repairs` | `number`                       | Requis   | Tentatives supplémentaires de réparation de sortie invalide ; zéro par défaut.                           |
| `read`    | `(text: string) => Promise<T>` | Requis   | Extrait la dernière réponse balisée complète et la valide ; échoue si le contenu est absent ou invalide. |

## Signature

```ts
export interface ResponseSpec<T> {
  readonly tag: string;
  readonly repairs: number;
  read(text: string): Promise<T>;
}
```
