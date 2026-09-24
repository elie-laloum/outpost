---
title: "RecoveryQuotaOptions"
description: "RecoveryQuotaOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryQuotaOptions**. See the [recovery and retention guide](../../operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryQuotaOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryQuotaOptions {
  readonly repository?: string;
  readonly maxBytes: number;
  readonly reserveBytes?: number;
  readonly maxEntries?: number;
}
```
