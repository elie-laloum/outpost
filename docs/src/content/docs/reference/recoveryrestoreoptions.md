---
title: "RecoveryRestoreOptions"
description: "RecoveryRestoreOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryRestoreOptions**. See the [recovery restoration guide](../../operations/recovery-restoration/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryRestoreOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryRestoreOptions {
  readonly directory: string;
  readonly repository: string;
  readonly destination: string;
  readonly side: "previous" | "incoming";
  readonly maxBytes?: number;
}
```
