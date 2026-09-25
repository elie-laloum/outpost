---
title: "RecoveryPruneResult"
description: "RecoveryPruneResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryPruneResult**. See the [recovery and retention guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryPruneResult } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name       | Type                                                             | Presence | Meaning                                                                 |
| ---------- | ---------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `removed`  | `readonly string[]`                                              | Required | See the linked contract and this family's rules for its interpretation. |
| `retained` | `readonly { readonly path: string; readonly reason: string; }[]` | Required | See the linked contract and this family's rules for its interpretation. |
| `after`    | `RecoveryRetentionPlan`                                          | Required | Declared task dependencies whose values may be read.                    |

## Signature

```ts
export interface RecoveryPruneResult {
  readonly removed: readonly string[];
  readonly retained: readonly {
    readonly path: string;
    readonly reason: string;
  }[];
  readonly after: RecoveryRetentionPlan;
}
```

## Related contracts

- [RecoveryRetentionPlan](../recoveryretentionplan/)
