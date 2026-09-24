---
title: "RecoveryRestorePlan"
description: "RecoveryRestorePlan — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryRestorePlan**. See the [recovery restoration guide](../../operations/recovery-restoration/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryRestorePlan } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryRestorePlan extends RecoveryRestoreOptions {
  readonly fingerprint: string;
  readonly manifestSha256: string;
  readonly commit: string;
  readonly payloads: readonly string[];
  readonly staging: "preserved" | "unavailable";
}
```

## Related contracts

- [RecoveryRestoreOptions](../recoveryrestoreoptions/)
