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

Inventory recovery state without deleting anything. Local mode scans the .outpost directory of the Git checkout, and optionally worktrees, locks and sandbox activity records; with transporter it lists that transport's objects and can read activity records, whose ownership stays unknown. git or locks with a transporter, or an invalid maxEntries, reject with code configuration.

[Complete example and detailed rules](../../guide/recovery/).

## Parameters and properties

| Name                  | Type                                     | Presence | Meaning                                                                                                                                                                                         |
| --------------------- | ---------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `RecoveryInspectionOptions \| undefined` | Optional | Local repository or transport inventory selection, entry limit and optional resource inspection. Git and process-lock checks require local mode.                                                |
| `options.transporter` | `Transport \| undefined`                 | Optional | Inventory this transport's objects instead of a local repository. Pass the transport given as activityTransport to read its activity records; git or locks then reject with code configuration. |
| `options.repository`  | `string \| undefined`                    | Optional | Git checkout to inspect, default the current directory, resolved to its top-level root. In transport mode, only echoed back as a label.                                                         |
| `options.maxEntries`  | `number \| undefined`                    | Optional | Maximum entries scanned before the inventory is marked incomplete, default 100000. Local resource inspection also stops at 10000 records; a non-positive value rejects with code configuration. |
| `options.git`         | `boolean \| undefined`                   | Optional | Adds the Git state of each workspace under .outpost: registration, HEAD, branch, dirty and locked flags. Local mode only.                                                                       |
| `options.locks`       | `boolean \| undefined`                   | Optional | Adds operation lock files with their owner's status. Local mode only.                                                                                                                           |
| `options.resources`   | `boolean \| undefined`                   | Optional | Adds sandbox activity records with their ownership verdicts, read from .outpost/storage or, with transporter, from that transport.                                                              |

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
