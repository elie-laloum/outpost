---
title: "RecoveryRetentionPolicy"
description: "RecoveryRetentionPolicy — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRetentionPolicy } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                                               | Presence | Meaning                                                                         |
| --------------- | -------------------------------------------------- | -------- | ------------------------------------------------------------------------------- |
| `version`       | `1`                                                | Required | Version of this serialized record format; currently 1.                          |
| `scopes`        | `readonly ("clean-workspaces" \| "closed-logs")[]` | Required | Storage classes eligible for pruning: clean workspaces and/or closed logs.      |
| `minAgeMs`      | `number`                                           | Required | Minimum age in milliseconds before a retention candidate is eligible.           |
| `maxBytes`      | `number \| undefined`                              | Optional | Target maximum retained storage in bytes; only eligible entries may be removed. |
| `maxWorkspaces` | `number \| undefined`                              | Optional | Target maximum number of retained workspaces; unsafe entries remain protected.  |

## Signature

```ts
export interface RecoveryRetentionPolicy {
  readonly version: 1;
  readonly scopes: readonly ("clean-workspaces" | "closed-logs")[];
  readonly minAgeMs: number;
  readonly maxBytes?: number;
  readonly maxWorkspaces?: number;
}
```
