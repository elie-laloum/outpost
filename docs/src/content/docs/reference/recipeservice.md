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

## Parameters and properties

| Name    | Type                                     | Presence | Meaning                                                                                                    |
| ------- | ---------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `start` | `(signal: AbortSignal) => Promise<void>` | Required | Start the explicitly selected service, honor cancellation and close its server or worker before resolving. |

## Signature

```ts
export interface RecipeService {
  start(signal: AbortSignal): Promise<void>;
}
```
