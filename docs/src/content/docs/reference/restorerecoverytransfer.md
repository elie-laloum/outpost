---
title: "restoreRecoveryTransfer"
description: "restoreRecoveryTransfer — Outpost API"
sidebar:
  order: 10
---

Public contract for **restoreRecoveryTransfer**. See the [recovery restoration guide](../../operations/recovery-restoration/) for behavior, defaults and examples.

## Import

```ts
import { restoreRecoveryTransfer } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function restoreRecoveryTransfer(
  plan: RecoveryRestorePlan,
): Promise<RecoveryRestoreResult>;
```

## Related contracts

- [RecoveryRestorePlan](../recoveryrestoreplan/)
- [RecoveryRestoreResult](../recoveryrestoreresult/)
