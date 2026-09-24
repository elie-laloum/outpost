---
title: "RecoveryVerificationOptions"
description: "RecoveryVerificationOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryVerificationOptions**. See the [recovery and retention guide](../../operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryVerificationOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryVerificationOptions {
  readonly restorability?: boolean;
  readonly repository?: string;
  readonly checksums?: boolean;
  readonly maxBytes?: number;
}
```
