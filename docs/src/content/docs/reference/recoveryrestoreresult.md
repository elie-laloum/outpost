---
title: "RecoveryRestoreResult"
description: "RecoveryRestoreResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryRestoreResult**. See the [recovery restoration guide](../../operations/recovery-restoration/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryRestoreResult } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryRestoreResult {
  readonly directory: string;
  readonly commit: string;
  readonly side: "previous" | "incoming";
  readonly staging: "preserved" | "unavailable";
  readonly sourceRetained: true;
}
```
