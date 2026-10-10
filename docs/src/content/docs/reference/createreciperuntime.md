---
title: "createRecipeRuntime"
description: "createRecipeRuntime — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createRecipeRuntime } from "@elie-laloum/outpost/recipes";
```

## Purpose and behavior

Validate a YAML project and create a caller-owned runtime. Each run imports declared extensions, creates its owned components and sandbox, executes the workflow, integrates according to branch policy and closes resources before publishing explicitly configured reports.

[Complete example and detailed rules](../../guide/recipe-extensions/).

## Parameters and properties

| Name               | Type                          | Presence | Meaning                                                                                            |
| ------------------ | ----------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `options`          | `RecipeProjectOptions`        | Required | Recipe and local configuration paths, plus optional caller-provided component descriptors.         |
| `options.file`     | `string`                      | Required | Recipe YAML path resolved from the process working directory.                                      |
| `options.config`   | `string`                      | Required | Required separate local execution YAML path; its directory anchors repository and extension paths. |
| `options.registry` | `RecipeRegistry \| undefined` | Optional | Additional trusted descriptors combined with native components; duplicate factory names fail.      |

## Returns

`Promise<RecipeRuntime>`

## Signature

```ts
export declare function createRecipeRuntime(
  options: RecipeProjectOptions,
): Promise<RecipeRuntime>;
```

## Related contracts

- [RecipeProjectOptions](../recipeprojectoptions/)
- [RecipeRuntime](../reciperuntime/)
