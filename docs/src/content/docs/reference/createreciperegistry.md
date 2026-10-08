---
title: "createRecipeRegistry"
description: "createRecipeRegistry — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createRecipeRegistry } from "@elie-laloum/outpost/recipes";
```

## Purpose and behavior

Create an immutable registry of additional component descriptors. Duplicate names fail immediately; the recipe runtime combines this registry with its native descriptors.

[Complete example and detailed rules](../../guide/yaml-recipes/).

## Parameters and properties

| Name                 | Type                                                | Presence | Meaning                                                                                     |
| -------------------- | --------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `options`            | `RecipeRegistryOptions \| undefined`                | Optional | Additional named component descriptors; omitted options create an empty extension registry. |
| `options.components` | `readonly RecipeComponentDefinition[] \| undefined` | Optional | Additional factory descriptors, each with a unique name.                                    |

## Returns

`RecipeRegistry`

## Signature

```ts
export declare function createRecipeRegistry(
  options?: RecipeRegistryOptions,
): RecipeRegistry;
```

## Related contracts

- [RecipeRegistry](../reciperegistry/)
- [RecipeRegistryOptions](../reciperegistryoptions/)
