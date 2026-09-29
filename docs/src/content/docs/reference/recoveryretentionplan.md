---
title: "RecoveryRetentionPlan"
description: "RecoveryRetentionPlan — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRetentionPlan } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                                  | Presence | Meaning                                                                                                                                                                                                |
| ---------------- | ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `source`         | `"transport" \| undefined`            | Optional | transport for a plan built with a transporter; absent for a local plan. pruneRecoveryRetention() then requires the same transporter.                                                                   |
| `repository`     | `string`                              | Required | Top-level path of the inspected checkout; for a transport plan, the repository option as given, or an empty string.                                                                                    |
| `policy`         | `RecoveryRetentionPolicy`             | Required | Copy of the validated policy; pruning and its after plan reuse it.                                                                                                                                     |
| `inspectedAt`    | `string`                              | Required | ISO timestamp taken after the inventory; entry ages are measured from it.                                                                                                                              |
| `inspection`     | `RecoveryInspection`                  | Required | Inventory the plan is based on, with Git worktree, lock and resource activity reports for a local plan.                                                                                                |
| `entries`        | `readonly RecoveryRetentionEntry[]`   | Required | One entry per inventoried item, each with eligibility, reason code and bytes.                                                                                                                          |
| `complete`       | `boolean`                             | Required | Whether the inventory, Git worktree checks and journal object sizes were all read within maxEntries. When false, no entry is eligible, quota is unknown and pruneRecoveryRetention() rejects the plan. |
| `usageBytes`     | `number`                              | Required | Bytes observed at inspection: file sizes under .outpost, or object sizes in the transport.                                                                                                             |
| `projectedBytes` | `number`                              | Required | usageBytes minus the bytes of eligible entries: the usage left if every candidate is removed.                                                                                                          |
| `quota`          | `"unknown" \| "within" \| "exceeded"` | Required | exceeded when projectedBytes is above maxBytes or the remaining worktrees are above maxWorkspaces, unknown when the inventory is incomplete, otherwise within.                                         |

## Signature

```ts
export interface RecoveryRetentionPlan {
  readonly source?: "transport";
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
