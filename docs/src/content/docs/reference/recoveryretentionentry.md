---
title: "RecoveryRetentionEntry"
description: "RecoveryRetentionEntry — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryRetentionEntry**. See the [recovery and retention guide](../../operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryRetentionEntry } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryRetentionEntry {
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
