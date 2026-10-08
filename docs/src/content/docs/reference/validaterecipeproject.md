---
title: "validateRecipeProject"
description: "validateRecipeProject — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { validateRecipeProject } from "@elie-laloum/outpost/recipes";
```

## Purpose and behavior

Read the separate recipe and configuration files and validate graph, named component references and extension metadata. Does not import user modules, read secret values or allocate sandboxes. Extension exports are checked only when running.

[Complete example and detailed rules](../../guide/yaml-recipes/).

## Parameters and properties

| Name               | Type                          | Presence | Meaning                                                                                            |
| ------------------ | ----------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `options`          | `RecipeProjectOptions`        | Required | Paths of the two YAML files and optional descriptors used to validate named components.            |
| `options.file`     | `string`                      | Required | Recipe YAML path resolved from the process working directory.                                      |
| `options.config`   | `string`                      | Required | Required separate local execution YAML path; its directory anchors repository and extension paths. |
| `options.registry` | `RecipeRegistry \| undefined` | Optional | Additional trusted descriptors combined with native components; duplicate factory names fail.      |

## Returns

`Promise<RecipeProjectValidation>`

## Signature

```ts
export declare function validateRecipeProject(
  options: RecipeProjectOptions,
): Promise<RecipeProjectValidation>;
```

## Related contracts

- [RecipeProjectOptions](../recipeprojectoptions/)
- [RecipeProjectValidation](../recipeprojectvalidation/)
