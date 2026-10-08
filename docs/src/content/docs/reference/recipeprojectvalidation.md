---
title: "RecipeProjectValidation"
description: "RecipeProjectValidation — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeProjectValidation } from "@elie-laloum/outpost/recipes";
```

## Parameters and properties

| Name                   | Type                | Presence | Meaning                                                                                 |
| ---------------------- | ------------------- | -------- | --------------------------------------------------------------------------------------- |
| `name`                 | `string`            | Required | Validated recipe name.                                                                  |
| `version`              | `number`            | Required | Recipe format version read from the recipe file.                                        |
| `configurationVersion` | `number`            | Required | Configuration format version read from the execution file.                              |
| `tasks`                | `readonly string[]` | Required | Task keys in dependency order.                                                          |
| `agents`               | `readonly string[]` | Required | Distinct agent roles required by the recipe.                                            |
| `extensions`           | `readonly string[]` | Required | Extension component names whose metadata was validated without importing their modules. |

## Signature

```ts
export interface RecipeProjectValidation {
  readonly name: string;
  readonly version: number;
  readonly configurationVersion: number;
  readonly tasks: readonly string[];
  readonly agents: readonly string[];
  readonly extensions: readonly string[];
}
```
