---
title: "RecipeRunOptions"
description: "RecipeRunOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeRunOptions } from "@elie-laloum/outpost/recipes";
```

## Parameters and properties

| Name     | Type                                                  | Presence | Meaning                                                                                                                            |
| -------- | ----------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `inputs` | `Readonly<Record<string, WorkflowJson>> \| undefined` | Optional | Declared recipe input values; format 3 also accepts lossless JSON objects, arrays and null. Inputs are validated before tasks run. |
| `signal` | `AbortSignal \| undefined`                            | Optional | Cancel this invocation while awaiting owned-resource cleanup.                                                                      |
| `report` | `"json" \| undefined`                                 | Optional | Explicitly replace configured final reports with one JSON report on stdout; does not enable observation.                           |

## Signature

```ts
export interface RecipeRunOptions {
  readonly inputs?: Readonly<Record<string, WorkflowJson>>;
  readonly signal?: AbortSignal;
  readonly report?: "json";
}
```

## Related contracts

- [WorkflowJson](../workflowjson/)
