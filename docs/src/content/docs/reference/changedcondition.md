---
title: "ChangedCondition"
description: "ChangedCondition — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ChangedCondition } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type                | Presence | Meaning                                                                                                                                                                   |
| ------- | ------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`  | `"changed"`         | Required | Literal changed discriminator, used by lifecycle preparation to select file-content checks.                                                                               |
| `files` | `readonly string[]` | Required | Exact files to hash in declaration order, relative to the command directory in the hook environment. Missing files are stable entries; unreadable files fail preparation. |

## Signature

```ts
export interface ChangedCondition {
  readonly kind: "changed";
  readonly files: readonly string[];
}
```
