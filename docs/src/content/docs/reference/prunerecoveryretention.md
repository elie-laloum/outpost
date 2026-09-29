---
title: "pruneRecoveryRetention"
description: "pruneRecoveryRetention — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { pruneRecoveryRetention } from "@elie-laloum/outpost";
```

## Purpose and behavior

Apply a retention plan after fresh validation. Worktree removal reacquires the Git branch lock. Local and remote journal groups use conditional object deletion; explicit transport plans require the same transporter in the second argument. Changed or partially removed candidates are retained; recovery data remains protected.

[Complete example and detailed rules](../../guide/recovery/).

## Parameters and properties

| Name                  | Type                                 | Presence | Meaning                                                                                                                    |
| --------------------- | ------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `plan`                | `RecoveryRetentionPlan`              | Required | Previously computed retention plan whose eligible entries must be revalidated before deletion.                             |
| `options`             | `TransportStoreOptions \| undefined` | Optional | Required transport binding for a plan with source transport; omitted for a local retention plan.                           |
| `options.transporter` | `Transport`                          | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |
| `observation`         | `ObservationHub \| undefined`        | Optional | Optional hub receiving start and terminal events for retention pruning; never persisted in the recovery plan or archive.   |

## Returns

`Promise<RecoveryPruneResult>`

## Signature

```ts
export declare function pruneRecoveryRetention(
  plan: RecoveryRetentionPlan,
  options?: TransportStoreOptions,
  observation?: ObservationHub,
): Promise<RecoveryPruneResult>;
```

## Related contracts

- [ObservationHub](../observationhub/)
- [RecoveryPruneResult](../recoverypruneresult/)
- [RecoveryRetentionPlan](../recoveryretentionplan/)
- [TransportStoreOptions](../transportstoreoptions/)
