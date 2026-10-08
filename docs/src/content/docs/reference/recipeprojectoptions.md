---
title: "RecipeProjectOptions"
description: "RecipeProjectOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeProjectOptions } from "@elie-laloum/outpost/recipes";
```

## Parameters and properties

| Name       | Type                          | Presence | Meaning                                                                                            |
| ---------- | ----------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `file`     | `string`                      | Required | Recipe YAML path resolved from the process working directory.                                      |
| `config`   | `string`                      | Required | Required separate local execution YAML path; its directory anchors repository and extension paths. |
| `registry` | `RecipeRegistry \| undefined` | Optional | Additional trusted descriptors combined with native components; duplicate factory names fail.      |

## Signature

```ts
export interface RecipeProjectOptions {
  readonly file: string;
  readonly config: string;
  readonly registry?: RecipeRegistry;
}
```

## Related contracts

- [RecipeRegistry](../reciperegistry/)
