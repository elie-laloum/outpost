---
title: "VariableQuestion"
description: "VariableQuestion — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { VariableQuestion } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type                       | Présence  | Rôle                                                               |
| -------- | -------------------------- | --------- | ------------------------------------------------------------------ |
| `key`    | `string`                   | Requis    | Nom de la variable de brief manquante dont la valeur est demandée. |
| `signal` | `AbortSignal \| undefined` | Optionnel | Annulation coopérative de cette opération.                         |

## Retour

`Promise<string>`

## Signature

```ts
export type VariableQuestion = (
  key: string,
  signal?: AbortSignal,
) => Promise<string>;
```
