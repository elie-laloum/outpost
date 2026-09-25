---
title: "RecoveryRetentionEntry"
description: "RecoveryRetentionEntry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRetentionEntry } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                                     | Presence | Meaning                                                                                                                |
| ------------ | ---------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `revision`   | `string \| undefined`                    | Optional | Expected journal index revision checked again before deletion in transport mode.                                       |
| `objects`    | `readonly TransportEntry[] \| undefined` | Optional | Versioned index and segments belonging to one remote journal; deletion revalidates the group and each object revision. |
| `path`       | `string`                                 | Required | Host path of the inspected storage entry.                                                                              |
| `category`   | `string`                                 | Required | Storage category of the retention candidate.                                                                           |
| `bytes`      | `number`                                 | Required | Observed bytes attributable to this retention candidate.                                                               |
| `eligible`   | `boolean`                                | Required | Whether the candidate passed retention safety, scope and age checks for removal.                                       |
| `reason`     | `string`                                 | Required | Explanation of why this retention candidate is eligible or must remain protected.                                      |
| `branch`     | `string \| undefined`                    | Optional | Name of the work branch used or observed during execution.                                                             |
| `head`       | `string \| undefined`                    | Optional | Git HEAD commit recorded by the inspection or snapshot.                                                                |
| `modifiedAt` | `string \| undefined`                    | Optional | ISO timestamp of the inspected entry’s last filesystem modification.                                                   |

## Signature

```ts
export interface RecoveryRetentionEntry {
  readonly revision?: string;
  readonly objects?: readonly TransportEntry[];
  readonly path: string;
  readonly category: string;
  readonly bytes: number;
  readonly eligible: boolean;
  readonly reason: string;
  readonly branch?: string;
  readonly head?: string;
  readonly modifiedAt?: string;
}
```

## Related contracts

- [TransportEntry](../transportentry/)
