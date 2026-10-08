---
title: "defineRecipeComponent"
description: "defineRecipeComponent — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineRecipeComponent } from "@elie-laloum/outpost/recipes";
```

## Purpose and behavior

Declare a named YAML component factory with a static options schema, result validator and optional owned-resource disposer. Declaration does not invoke the factory.

[Complete example and detailed rules](../../guide/yaml-recipes/).

## Parameters and properties

| Name         | Type                        | Presence | Meaning                                                                                |
| ------------ | --------------------------- | -------- | -------------------------------------------------------------------------------------- |
| `definition` | `RecipeComponentDefinition` | Required | Factory descriptor to validate and freeze; it defines one component name and category. |

## Returns

`RecipeComponentDefinition`

## Signature

```ts
export declare function defineRecipeComponent(
  definition: RecipeComponentDefinition,
): RecipeComponentDefinition;
```

## Related contracts

- [RecipeComponentDefinition](../recipecomponentdefinition/)
