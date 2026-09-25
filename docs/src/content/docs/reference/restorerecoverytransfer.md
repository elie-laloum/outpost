---
title: "restoreRecoveryTransfer"
description: "restoreRecoveryTransfer — Outpost API"
sidebar:
  order: 10
---

Public contract for **restoreRecoveryTransfer**. See the [recovery restoration guide](../../guide/operations/recovery-restoration/) for behavior, defaults and examples.

## Import

```ts
import { restoreRecoveryTransfer } from "@elie-laloum/outpost";
```

## Purpose and behavior

Plan then apply a retained transfer into a new destination for review.

Restore into a new directory and inspect before integration. Verification checks recorded structure and integrity; it does not authenticate the author.

[Complete example and detailed rules](../../guide/operations/recovery-restoration/).

## Parameters and properties

| Name   | Type                  | Presence | Meaning                                                                 |
| ------ | --------------------- | -------- | ----------------------------------------------------------------------- |
| `plan` | `RecoveryRestorePlan` | Required | See the linked contract and this family's rules for its interpretation. |

## Returns

`Promise<RecoveryRestoreResult>`

## Signature

```ts
export declare function restoreRecoveryTransfer(
  plan: RecoveryRestorePlan,
): Promise<RecoveryRestoreResult>;
```

## Related contracts

- [RecoveryRestorePlan](../recoveryrestoreplan/)
- [RecoveryRestoreResult](../recoveryrestoreresult/)
