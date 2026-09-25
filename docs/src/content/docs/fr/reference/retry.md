---
title: "Retry"
description: "Retry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Retry } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                                          | Présence  | Rôle                                                                         |
| ---------- | ------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------- |
| `attempts` | `number`                                                      | Requis    | Nombre maximal total de tentatives, première exécution comprise.             |
| `delayMs`  | `number \| undefined`                                         | Optionnel | Délai en millisecondes avant une reprise ; zéro par défaut.                  |
| `accepts`  | `((error: unknown, attempt: number) => boolean) \| undefined` | Optionnel | Prédicat déterminant si l’échec de la tentative donnée autorise une reprise. |

## Signature

```ts
export interface Retry {
  readonly attempts: number;
  readonly delayMs?: number;
  readonly accepts?: (error: unknown, attempt: number) => boolean;
}
```
