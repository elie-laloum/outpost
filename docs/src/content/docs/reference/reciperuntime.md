---
title: "RecipeRuntime"
description: "RecipeRuntime — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeRuntime } from "@elie-laloum/outpost/recipes";
```

## Parameters and properties

| Name                    | Type                                                    | Presence | Meaning                                                                                      |
| ----------------------- | ------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `run`                   | `(options?: RecipeRunOptions) => Promise<RecipeReport>` | Required | Run one invocation at a time; close its owned resources before returning its report.         |
| `close`                 | `() => Promise<void>`                                   | Required | Prevent further runs, cancel the active run and wait for its cleanup; repeat calls are safe. |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                   | Required | Close the runtime when leaving an await using scope.                                         |

## Signature

```ts
export interface RecipeRuntime {
  run(options?: RecipeRunOptions): Promise<RecipeReport>;
  close(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}
```

## Related contracts

- [RecipeReport](../support-recipereport/)
- [RecipeRunOptions](../reciperunoptions/)
