---
title: "RecipeComponentContext"
description: "RecipeComponentContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeComponentContext } from "@elie-laloum/outpost/recipes";
```

## Parameters and properties

| Name          | Type                                               | Presence | Meaning                                                                                              |
| ------------- | -------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `kindOf`      | `(name: string) => string`                         | Required | Returns the declared category of a named component without constructing it; unknown references fail. |
| `directory`   | `string`                                           | Required | Absolute directory containing the local execution YAML; resolve local extension paths from it.       |
| `signal`      | `AbortSignal`                                      | Required | Cancellation shared with the active recipe invocation.                                               |
| `resolve`     | `(name: string, kind: string) => Promise<unknown>` | Required | Resolve one named component and require its declared category; repeated requests share its instance. |
| `environment` | `(name: string) => string`                         | Required | Read one explicitly named host environment variable; absent or malformed names fail.                 |

## Signature

```ts
export interface RecipeComponentContext {
  kindOf(name: string): string;
  readonly directory: string;
  readonly signal: AbortSignal;
  resolve(name: string, kind: string): Promise<unknown>;
  environment(name: string): string;
}
```
