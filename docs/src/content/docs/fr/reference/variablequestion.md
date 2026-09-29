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

| Nom      | Type                       | Présence  | Rôle                                                                                                |
| -------- | -------------------------- | --------- | --------------------------------------------------------------------------------------------------- |
| `key`    | `string`                   | Requis    | Nom de la variable manquante, tel qu’écrit entre {{ }} dans le fichier du brief.                    |
| `signal` | `AbortSignal \| undefined` | Optionnel | Signal d’annulation de l’attach, s’il en a un ; cessez d’attendre une réponse dès qu’il est annulé. |

## Retour

`Promise<string>`

## Signature

```ts
export type VariableQuestion = (
  key: string,
  signal?: AbortSignal,
) => Promise<string>;
```
