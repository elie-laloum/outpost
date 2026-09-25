---
title: "BranchPolicy"
description: "BranchPolicy — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { BranchPolicy } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name   | Type                                  | Presence          | Meaning                                                                                                                    |
| ------ | ------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `mode` | `"current" \| "named" \| "integrate"` | Required          | current uses the current checkout, named retains a chosen work branch, integrate prepares a branch to merge into the base. |
| `name` | `string`                              | Variant-dependent | Name of the work branch retained by named mode.                                                                            |
| `from` | `string \| undefined`                 | Variant-dependent | Git revision used as the starting point for the managed work branch.                                                       |

## Signature

```ts
export type BranchPolicy =
  | {
      readonly mode: "current";
    }
  | {
      readonly mode: "named";
      readonly name: string;
      readonly from?: string;
    }
  | {
      readonly mode: "integrate";
      readonly from?: string;
    };
```
