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

Apply a retention plan after fresh validation. Local plans reacquire filesystem ownership; transport plans require the same transporter in the second argument, revalidate closed journal groups and condition every deletion on its revision. Changed or partially removed candidates are reported as retained; recovery data remains protected.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name                  | Type                                 | Presence | Meaning                                                                                                                    |
| --------------------- | ------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `plan`                | `RecoveryRetentionPlan`              | Required | Previously computed retention plan whose eligible entries must be revalidated before deletion.                             |
| `options`             | `TransportStoreOptions \| undefined` | Optional | Required transport binding for a plan with source transport; omitted for a local retention plan.                           |
| `options.transporter` | `Transport`                          | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |

## Returns

`Promise<RecoveryPruneResult>`

## Signature

```ts
export declare function pruneRecoveryRetention(
  plan: RecoveryRetentionPlan,
  options?: TransportStoreOptions,
): Promise<RecoveryPruneResult>;
```

## Related contracts

- [RecoveryPruneResult](../recoverypruneresult/)
- [RecoveryRetentionPlan](../recoveryretentionplan/)
- [TransportStoreOptions](../transportstoreoptions/)
