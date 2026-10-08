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

Parse and validate a version-1 local YAML recipe, bind its command and named-agent steps to the supplied sandbox, and return a Workflow without executing it. Dependencies may refer forward; unknown fields, duplicate keys, unsupported YAML constructs, missing agents and invalid graphs throw before execution. The caller owns the sandbox. start() requires concurrency 1 and uses the existing workflow retries, cancellation, results and usage accounting.

[Complete example and detailed rules](../../guide/yaml-recipes/).

## Parameters and properties

| Name       | Type             | Presence | Meaning                                                                                                                                                                                                                                                                     |
| ---------- | ---------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`   | `string`         | Required | Literal YAML 1.2 text containing version: 1, name and a nonempty tasks list, bounded to 1 MiB and 1,000 tasks; aliases and custom tags are refused. Each task selects command or agent with brief, with optional after, retry and timeoutMs. Values are never interpolated. |
| `bindings` | `RecipeBindings` | Required | Open sandbox and optional agent registry borrowed by every recipe task. No resource is allocated or closed by defineRecipe(); the caller keeps ownership.                                                                                                                   |

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
