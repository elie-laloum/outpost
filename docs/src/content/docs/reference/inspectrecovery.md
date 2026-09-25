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

Inventory the target repository’s .outpost storage, with optional Git, lock and locally recorded sandbox activity checks. Inspection is read-only, bounded by maxEntries, and does not enumerate cloud provider accounts.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name                 | Type                                     | Presence | Meaning                                                                       |
| -------------------- | ---------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `options`            | `RecoveryInspectionOptions \| undefined` | Optional | Repository, scan bound and optional Git, lock and resource inspections.       |
| `options.repository` | `string \| undefined`                    | Optional | Target host Git checkout.                                                     |
| `options.maxEntries` | `number \| undefined`                    | Optional | Maximum filesystem entries inspected before marking the inventory incomplete. |
| `options.git`        | `boolean \| undefined`                   | Optional | Include Git worktree state and dirty/locked checks in the inventory.          |
| `options.locks`      | `boolean \| undefined`                   | Optional | Include local lock-file and process-ownership inspection.                     |
| `options.resources`  | `boolean \| undefined`                   | Optional | Include locally recorded sandbox leases and active operations.                |

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
