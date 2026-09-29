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

Recheck a plan, then clone the repository into its destination, detach at the plan's commit and apply the side's patches and untracked files. The repository and the transfer stay unchanged. A plan or transfer changed since planning rejects with code configuration; a failure after the destination is created rejects with code workspace and keeps the partial destination.

[Complete example and detailed rules](../../guide/recovery/).

## Parameters and properties

| Name          | Type                          | Presence | Meaning                                                                                                       |
| ------------- | ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `plan`        | `RecoveryRestorePlan`         | Required | Plan returned by planRecoveryRestore(). Any edited field fails its fingerprint check with code configuration. |
| `observation` | `ObservationHub \| undefined` | Optional | Hub that receives the recovery operation restore.apply when it starts, finishes or fails.                     |

## Returns

`Promise<RecoveryRestoreResult>`

## Signature

```ts
export declare function restoreRecoveryTransfer(
  plan: RecoveryRestorePlan,
  observation?: ObservationHub,
): Promise<RecoveryRestoreResult>;
```

## Related contracts

- [ObservationHub](../observationhub/)
- [RecoveryRestorePlan](../recoveryrestoreplan/)
- [RecoveryRestoreResult](../recoveryrestoreresult/)
