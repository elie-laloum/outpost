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

Apply a previously reviewed retention plan. Reacquire ownership and revalidate each candidate before removal; report removed paths, retained entries and a fresh plan after pruning.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name   | Type                    | Presence | Meaning                                                                                        |
| ------ | ----------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `plan` | `RecoveryRetentionPlan` | Required | Previously computed retention plan whose eligible entries must be revalidated before deletion. |

## Returns

`Promise<RecoveryPruneResult>`

## Signature

```ts
export declare function pruneRecoveryRetention(
  plan: RecoveryRetentionPlan,
): Promise<RecoveryPruneResult>;
```

## Related contracts

- [RecoveryPruneResult](../recoverypruneresult/)
- [RecoveryRetentionPlan](../recoveryretentionplan/)
