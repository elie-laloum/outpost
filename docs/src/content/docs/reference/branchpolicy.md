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

| Name   | Type                                  | Presence          | Meaning                                                                                                                                                                                                                    |
| ------ | ------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode` | `"current" \| "named" \| "integrate"` | Required          | current works in the checkout itself; named works on the branch name in a worktree under .outpost/workspaces; integrate creates an outpost/&lt;label>-&lt;id> branch there, which integrate() merges into the base branch. |
| `name` | `string`                              | Variant-dependent | Work branch for named mode, kept when the workspace closes. An existing branch continues from its tip and reuses its managed worktree; one checked out outside .outpost/workspaces fails with code conflict.               |
| `from` | `string \| undefined`                 | Variant-dependent | Revision a new work branch starts from, default HEAD. Ignored when the named branch already exists.                                                                                                                        |

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
