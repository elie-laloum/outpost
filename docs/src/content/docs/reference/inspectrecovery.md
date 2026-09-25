---
title: "inspectRecovery"
description: "inspectRecovery — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { inspectRecovery } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect local runtime files or objects in an explicit transport without deleting them. Local mode can inspect Git, process locks and resources; transport mode lists payload sizes, revisions and optionally resource records whose remote ownership remains unverified. Incomplete inventories are reported and cannot authorize pruning.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name                  | Type                                     | Presence | Meaning                                                                                                                                          |
| --------------------- | ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`             | `RecoveryInspectionOptions \| undefined` | Optional | Local repository or transport inventory selection, entry limit and optional resource inspection. Git and process-lock checks require local mode. |
| `options.transporter` | `Transport \| undefined`                 | Optional | Inventory object keys and optionally resource records in this transport; host Git and lock inspection are unsupported.                           |
| `options.repository`  | `string \| undefined`                    | Optional | Target host Git checkout.                                                                                                                        |
| `options.maxEntries`  | `number \| undefined`                    | Optional | Maximum filesystem entries inspected before marking the inventory incomplete.                                                                    |
| `options.git`         | `boolean \| undefined`                   | Optional | Include Git worktree state and dirty/locked checks in the inventory.                                                                             |
| `options.locks`       | `boolean \| undefined`                   | Optional | Include local lock-file and process-ownership inspection.                                                                                        |
| `options.resources`   | `boolean \| undefined`                   | Optional | Include locally recorded sandbox leases and active operations.                                                                                   |

## Returns

`Promise<RecoveryInspection>`

## Signature

```ts
export declare function inspectRecovery(
  options?: RecoveryInspectionOptions,
): Promise<RecoveryInspection>;
```

## Related contracts

- [RecoveryInspection](../recoveryinspection/)
- [RecoveryInspectionOptions](../recoveryinspectionoptions/)
