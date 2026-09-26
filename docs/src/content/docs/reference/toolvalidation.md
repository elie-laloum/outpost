---
title: "ToolValidation"
description: "ToolValidation — Outpost API"
sidebar:
  order: 10
---

:::caution[Experimental]
Experimental: part of the built-in harness engine introduced in 5.0.0. The contract may change in a later release.
:::

## Import

```ts
import type { ToolValidation } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name     | Type     | Presence          | Meaning                                                                |
| -------- | -------- | ----------------- | ---------------------------------------------------------------------- |
| `value`  | `Input`  | Variant-dependent | Validated input passed to execute.                                     |
| `issues` | `string` | Variant-dependent | Readable validation problems returned to the model as an error result. |

## Signature

```ts
export type ToolValidation<Input> =
  | {
      readonly value: Input;
    }
  | {
      readonly issues: string;
    };
```
