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

Parse and validate a local YAML recipe, bind commands and named agents to a caller-owned sandbox, and return a sequential Workflow. Version 1 keeps strings literal; version 2 resolves typed inputs and explicit references to direct dependency outputs. Never allocate, integrate or close the sandbox; the caller owns those actions. Workflow retries, cancellation and usage accounting remain available.

[Complete example and detailed rules](../../guide/yaml-recipes/).

## Parameters and properties

| Name       | Type             | Presence | Meaning                                                                                                                                                                                                                             |
| ---------- | ---------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`   | `string`         | Required | YAML 1.2 text in recipe format 1 (literal) or 2 (typed inputs and explicit references), bounded to 1 MiB and 1,000 tasks. Unknown fields, unsupported YAML constructs, invalid graphs and references are rejected before execution. |
| `bindings` | `RecipeBindings` | Required | Open sandbox and optional agent registry borrowed by every recipe task. No resource is allocated or closed by defineRecipe(); the caller keeps ownership.                                                                           |

## Returns

`Workflow`

## Signature

```ts
export declare function defineRecipe(
  source: string,
  bindings: RecipeBindings,
): Workflow;
```

## Related contracts

- [RecipeBindings](../recipebindings/)
- [Workflow](../type-workflow/)
