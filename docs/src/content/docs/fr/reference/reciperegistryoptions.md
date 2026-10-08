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

## Paramètres et propriétés

| Nom          | Type                                                | Présence  | Rôle                                                                  |
| ------------ | --------------------------------------------------- | --------- | --------------------------------------------------------------------- |
| `components` | `readonly RecipeComponentDefinition[] \| undefined` | Optionnel | Descripteurs supplémentaires de factories, chacun avec un nom unique. |

## Signature

```ts
export interface RecipeRegistryOptions {
  readonly components?: readonly RecipeComponentDefinition[];
}
```

## Contrats associés

- [RecipeComponentDefinition](../recipecomponentdefinition/)
