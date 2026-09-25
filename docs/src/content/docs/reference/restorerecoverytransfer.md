---
title: "restoreRecoveryTransfer"
description: "restoreRecoveryTransfer — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { restoreRecoveryTransfer } from "@elie-laloum/outpost";
```

## Purpose and behavior

Revalidate a restoration plan and materialize the selected retained state into its new destination. Source recovery artifacts remain available, and the result reports whether staging could be preserved. Review the destination before integrating it.

[Complete example and detailed rules](../../guide/operations/recovery-restoration/).

## Parameters and properties

| Name   | Type                  | Presence | Meaning                                                                                  |
| ------ | --------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `plan` | `RecoveryRestorePlan` | Required | Restoration plan binding source, destination, selected state and integrity fingerprints. |

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
