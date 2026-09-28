---
title: "LoopCheckResult"
description: "LoopCheckResult — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { LoopCheckResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom        | Type            | Présence          | Rôle                                                                                                           |
| ---------- | --------------- | ----------------- | -------------------------------------------------------------------------------------------------------------- |
| `done`     | `true \| false` | Requis            | True accepte ce candidat et termine la boucle ; false passe au tour suivant si la limite le permet.            |
| `feedback` | `string`        | Selon la variante | Texte requis lorsque done vaut false, transmis sans modification à l’essai suivant et conservé à l’épuisement. |

## Signature

```ts
export type LoopCheckResult =
  | {
      readonly done: true;
    }
  | {
      readonly done: false;
      readonly feedback: string;
    };
```
