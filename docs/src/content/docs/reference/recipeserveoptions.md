---
title: "RecipeServeOptions"
description: "RecipeServeOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeServeOptions } from "@elie-laloum/outpost/recipes";
```

## Parameters and properties

| Name      | Type                       | Presence | Meaning                                                                                          |
| --------- | -------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `service` | `string`                   | Required | Service name, with an optional services. prefix; unknown names fail before resource preparation. |
| `signal`  | `AbortSignal \| undefined` | Optional | Cancel this service invocation while retaining runtime ownership of its prepared dependencies.   |

## Signature

```ts
export interface RecipeServeOptions {
  readonly service: string;
  readonly signal?: AbortSignal;
}
```
