---
title: "RecoveryRetentionPolicy"
description: "RecoveryRetentionPolicy — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryRetentionPolicy**. See the [recovery and retention guide](../../operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryRetentionPolicy } from "@elie-laloum/outpost";
```

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
