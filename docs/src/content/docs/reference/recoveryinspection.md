---
title: "RecoveryInspection"
description: "RecoveryInspection — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryInspection } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                                  | Presence | Meaning                                                                                              |
| ---------------- | ------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `repository`     | `string`                              | Required | Target host Git checkout.                                                                            |
| `activity`       | `"unverified"`                        | Required | Always unverified: filesystem inventory alone cannot prove that retained resources are inactive.     |
| `git`            | `WorkspaceGitInspection \| undefined` | Optional | Git worktree state report, present when Git inspection was requested.                                |
| `locks`          | `LockInspection \| undefined`         | Optional | Local lock ownership report, present when lock inspection was requested.                             |
| `resources`      | `ResourceInspection \| undefined`     | Optional | Local sandbox activity report, present when resource inspection was requested.                       |
| `root`           | `string`                              | Required | Repository-local .outpost directory whose storage was inspected.                                     |
| `categories`     | `readonly StorageCategory[]`          | Required | Storage grouped into recovery, logs, locks and workspaces.                                           |
| `usage`          | `Readonly<StorageUsage>`              | Required | Observed storage bytes and counts of files, directories, symbolic links and other entries.           |
| `issues`         | `readonly StorageIssue[]`             | Required | Filesystem, Git or ownership problems that prevented complete inspection.                            |
| `complete`       | `boolean`                             | Required | Whether all requested inspection work completed without hitting scan limits or inaccessible entries. |
| `scannedEntries` | `number`                              | Required | Number of filesystem entries visited within the inspection bound.                                    |
| `maxEntries`     | `number`                              | Required | Maximum filesystem entries inspected before marking the inventory incomplete.                        |

## Signature

```ts
export interface RecoveryInspection extends StorageInventory {
  readonly repository: string;
  readonly activity: "unverified";
  readonly git?: WorkspaceGitInspection;
  readonly locks?: LockInspection;
  readonly resources?: ResourceInspection;
}
```

## Related contracts

- [LockInspection](../support-lockinspection/)
- [ResourceInspection](../resourceinspection/)
- [StorageInventory](../support-storageinventory/)
- [WorkspaceGitInspection](../support-workspacegitinspection/)
