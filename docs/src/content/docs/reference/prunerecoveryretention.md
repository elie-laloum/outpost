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

Remove the eligible entries of a complete plan, checking each against a fresh plan first; a changed or failed candidate is retained with its reason. Worktrees are removed under their branch lock and keep their branch; journal and cache objects are deleted with conditional writes. An incomplete plan or a transporter that does not match the plan's source rejects with code configuration.

[Complete example and detailed rules](../../guide/retention/).

## Parameters and properties

| Name                  | Type                                 | Presence | Meaning                                                                                                                    |
| --------------------- | ------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `plan`                | `RecoveryRetentionPlan`              | Required | Complete plan from planRecoveryRetention(); only its eligible entries are candidates.                                      |
| `options`             | `TransportStoreOptions \| undefined` | Optional | { transporter } used to build a plan whose source is transport; must be omitted for a local plan.                          |
| `options.transporter` | `Transport`                          | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |
| `observation`         | `ObservationHub \| undefined`        | Optional | Hub receiving the started, then finished or failed, operation event retention.prune with its duration.                     |

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
