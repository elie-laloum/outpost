---
title: "RecipeRegistryOptions"
description: "RecipeRegistryOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeRegistryOptions } from "@elie-laloum/outpost/recipes";
```

## Parameters and properties

| Name         | Type                                                | Presence | Meaning                                                  |
| ------------ | --------------------------------------------------- | -------- | -------------------------------------------------------- |
| `components` | `readonly RecipeComponentDefinition[] \| undefined` | Optional | Additional factory descriptors, each with a unique name. |

## Signature

```ts
export interface RecipeRegistryOptions {
  readonly components?: readonly RecipeComponentDefinition[];
}
```

## Related contracts

- [RecipeComponentDefinition](../recipecomponentdefinition/)
