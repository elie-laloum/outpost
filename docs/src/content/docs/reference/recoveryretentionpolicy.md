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

| Name            | Type                                                               | Presence | Meaning                                                                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `version`       | `1`                                                                | Required | Policy format version; must be 1.                                                                                                                                                                                  |
| `scopes`        | `readonly ("clean-workspaces" \| "closed-logs" \| "task-cache")[]` | Required | Data that may become eligible: clean-workspaces (clean worktrees on a branch, local only), closed-logs (closed journals) and task-cache (task cache entries). At least one; nothing outside them is ever eligible. |
| `minAgeMs`      | `number`                                                           | Required | Minimum time since the entry's last modification, in milliseconds; 0 accepts any age. For a journal, the index and every segment must be old enough.                                                               |
| `maxBytes`      | `number \| undefined`                                              | Optional | Limit on projectedBytes; above it the plan's quota is exceeded. It never makes more entries eligible.                                                                                                              |
| `maxWorkspaces` | `number \| undefined`                                              | Optional | Limit on the worktrees left after pruning; above it the plan's quota is exceeded. It never makes more worktrees eligible, and a transporter rejects it with code configuration.                                    |

## Signature

```ts
export interface RecoveryRetentionPolicy {
  readonly version: 1;
  readonly scopes: readonly (
    "clean-workspaces" | "closed-logs" | "task-cache"
  )[];
  readonly minAgeMs: number;
  readonly maxBytes?: number;
  readonly maxWorkspaces?: number;
}
```
