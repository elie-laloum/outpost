---
title: "RecipeRegistry"
description: "RecipeRegistry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeRegistry } from "@elie-laloum/outpost/recipes";
```

## Parameters and properties

| Name         | Type                                          | Presence | Meaning                                                    |
| ------------ | --------------------------------------------- | -------- | ---------------------------------------------------------- |
| `components` | `readonly RecipeComponentDefinition[]`        | Required | Immutable list of registered component descriptors.        |
| `get`        | `(name: string) => RecipeComponentDefinition` | Required | Find an exact factory name; unknown names fail explicitly. |

## Signature

```ts
export interface RecipeRegistry {
  readonly components: readonly RecipeComponentDefinition[];
  get(name: string): RecipeComponentDefinition;
}
```

## Related contracts

- [RecipeComponentDefinition](../recipecomponentdefinition/)
