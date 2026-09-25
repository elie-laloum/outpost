---
title: "RecoveryRetentionPlan"
description: "RecoveryRetentionPlan — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryRetentionPlan**. See the [recovery and retention guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryRetentionPlan } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name             | Type                                  | Presence | Meaning                                                                 |
| ---------------- | ------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `repository`     | `string`                              | Required | Target host Git checkout.                                               |
| `policy`         | `RecoveryRetentionPolicy`             | Required | See the linked contract and this family's rules for its interpretation. |
| `inspectedAt`    | `string`                              | Required | See the linked contract and this family's rules for its interpretation. |
| `inspection`     | `RecoveryInspection`                  | Required | See the linked contract and this family's rules for its interpretation. |
| `entries`        | `readonly RecoveryRetentionEntry[]`   | Required | See the linked contract and this family's rules for its interpretation. |
| `complete`       | `boolean`                             | Required | See the linked contract and this family's rules for its interpretation. |
| `usageBytes`     | `number`                              | Required | See the linked contract and this family's rules for its interpretation. |
| `projectedBytes` | `number`                              | Required | See the linked contract and this family's rules for its interpretation. |
| `quota`          | `"unknown" \| "within" \| "exceeded"` | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface RecoveryRetentionPlan {
  readonly repository: string;
  readonly policy: RecoveryRetentionPolicy;
  readonly inspectedAt: string;
  readonly inspection: RecoveryInspection;
  readonly entries: readonly RecoveryRetentionEntry[];
  readonly complete: boolean;
  readonly usageBytes: number;
  readonly projectedBytes: number;
  readonly quota: "within" | "exceeded" | "unknown";
}
```

## Related contracts

- [RecoveryInspection](../recoveryinspection/)
- [RecoveryRetentionEntry](../recoveryretentionentry/)
- [RecoveryRetentionPolicy](../recoveryretentionpolicy/)
