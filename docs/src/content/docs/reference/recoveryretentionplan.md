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

| Name             | Type                                  | Presence | Meaning                                                                                                            |
| ---------------- | ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `source`         | `"transport" \| undefined`            | Optional | Present as transport for an object-storage plan; pruning then requires the same configured transporter separately. |
| `repository`     | `string`                              | Required | Target host Git checkout.                                                                                          |
| `policy`         | `RecoveryRetentionPolicy`             | Required | Explicit storage scopes, minimum age and capacity targets used to decide retention eligibility.                    |
| `inspectedAt`    | `string`                              | Required | ISO timestamp when the retention inventory was taken.                                                              |
| `inspection`     | `RecoveryInspection`                  | Required | Full recovery inventory on which the retention decisions are based.                                                |
| `entries`        | `readonly RecoveryRetentionEntry[]`   | Required | Retention candidates with eligibility, safety reason and observed size.                                            |
| `complete`       | `boolean`                             | Required | Whether all requested inspection work completed without hitting scan limits or inaccessible entries.               |
| `usageBytes`     | `number`                              | Required | Total storage bytes observed before applying the retention plan.                                                   |
| `projectedBytes` | `number`                              | Required | Estimated retained bytes after removing all eligible candidates.                                                   |
| `quota`          | `"unknown" \| "within" \| "exceeded"` | Required | Whether projected usage is within the policy limit, exceeded or unknown due to incomplete inspection.              |

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
