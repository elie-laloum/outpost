---
title: "defineRecipe"
description: "defineRecipe — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineRecipe } from "@elie-laloum/outpost";
```

## Purpose and behavior

Parse and validate a local YAML recipe and compile it into a Workflow. Format 1 keeps strings literal; format 2 adds typed scalar inputs and direct dependency references; format 3 adds structured inputs, conditions, callbacks, loops, decisions and isolated tasks. The engine borrows the supplied sandbox: its caller owns integration and cleanup. Isolated tasks own their separate resources. Workflow retries, cancellation and usage accounting apply.

[Complete example and detailed rules](../../guide/yaml-recipes/).

## Parameters and properties

| Name       | Type                  | Presence | Meaning                                                                                                                                                                                                                             |
| ---------- | --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`   | `string`              | Required | YAML 1.2 text in recipe format 1 (literal) or 2 (typed inputs and explicit references), bounded to 1 MiB and 1,000 tasks. Unknown fields, unsupported YAML constructs, invalid graphs and references are rejected before execution. |
| `bindings` | `MixedRecipeBindings` | Required | Open sandbox and optional agent registry borrowed by every recipe task. No resource is allocated or closed by defineRecipe(); the caller keeps ownership.                                                                           |

## Returns

`Workflow`

## Signature

```ts
export declare function defineRecipe(
  source: string,
  bindings: MixedRecipeBindings,
): Workflow;
```

## Related contracts

- [MixedRecipeBindings](../mixedrecipebindings/)
- [Workflow](../type-workflow/)
