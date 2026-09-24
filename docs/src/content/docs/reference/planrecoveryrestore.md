---
title: "planRecoveryRestore"
description: "planRecoveryRestore — Outpost API"
sidebar:
  order: 10
---

Public contract for **planRecoveryRestore**. See the [recovery restoration guide](../../operations/recovery-restoration/) for behavior, defaults and examples.

## Import

```ts
import { planRecoveryRestore } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function planRecoveryRestore(
  options: RecoveryRestoreOptions,
): Promise<RecoveryRestorePlan>;
```

## Related contracts

- [RecoveryRestoreOptions](../recoveryrestoreoptions/)
- [RecoveryRestorePlan](../recoveryrestoreplan/)
