---
title: "RecipeService"
description: "RecipeService — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeService } from "@elie-laloum/outpost/recipes";
```

## Paramètres et propriétés

| Nom     | Type                                     | Présence | Rôle                                                                                                                 |
| ------- | ---------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `start` | `(signal: AbortSignal) => Promise<void>` | Requis   | Démarre le service explicitement sélectionné, respecte l’annulation et ferme son serveur ou worker avant résolution. |

## Signature

```ts
export interface RecipeService {
  start(signal: AbortSignal): Promise<void>;
}
```
