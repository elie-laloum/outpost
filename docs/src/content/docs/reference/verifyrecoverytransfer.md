---
title: "verifyRecoveryTransfer"
description: "verifyRecoveryTransfer — Outpost API"
sidebar:
  order: 10
---

Public contract for **verifyRecoveryTransfer**. See the [recovery and retention guide](../../operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import { verifyRecoveryTransfer } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function verifyRecoveryTransfer(
  path: string,
  options?: RecoveryVerificationOptions,
): Promise<RecoveryVerification>;
```

## Related contracts

- [RecoveryVerification](../recoveryverification/)
- [RecoveryVerificationOptions](../recoveryverificationoptions/)
