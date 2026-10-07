---
title: "RepetitionPolicy"
description: "RepetitionPolicy — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RepetitionPolicy } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type     | Presence | Meaning                                                                                                                                                                                                                                                                                                                               |
| ------------ | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `window`     | `number` | Required | Positive integer from 2 to 10000: number of latest decoded tool/file-change events retained across resumed turns in one execution, reset between passes and alerts. Text and results do not advance the window; duplicate call IDs within the window count once per kind and scope.                                                   |
| `maxRepeats` | `number` | Required | Occurrence count that triggers stuck, including the first call. Integer from 2 to window; calls need not be consecutive. Object key order is ignored, array order and exact strings are significant; missing inputs match each other separately from null, and other unsupported non-JSON inputs advance the window but do not match. |

## Signature

```ts
export interface RepetitionPolicy {
  readonly window: number;
  readonly maxRepeats: number;
}
```
