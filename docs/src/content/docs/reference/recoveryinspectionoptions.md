---
title: "RecoveryInspectionOptions"
description: "RecoveryInspectionOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryInspectionOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                   | Presence | Meaning                                                                       |
| ------------ | ---------------------- | -------- | ----------------------------------------------------------------------------- |
| `repository` | `string \| undefined`  | Optional | Target host Git checkout.                                                     |
| `maxEntries` | `number \| undefined`  | Optional | Maximum filesystem entries inspected before marking the inventory incomplete. |
| `git`        | `boolean \| undefined` | Optional | Include Git worktree state and dirty/locked checks in the inventory.          |
| `locks`      | `boolean \| undefined` | Optional | Include local lock-file and process-ownership inspection.                     |
| `resources`  | `boolean \| undefined` | Optional | Include locally recorded sandbox leases and active operations.                |

## Signature

```ts
export interface RecoveryInspectionOptions {
  readonly repository?: string;
  readonly maxEntries?: number;
  readonly git?: boolean;
  readonly locks?: boolean;
  readonly resources?: boolean;
}
```
