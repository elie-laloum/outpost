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

| Name             | Type                                  | Presence | Meaning                                                                                                                                     |
| ---------------- | ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `repository`     | `string`                              | Required | Canonical local repository when inspecting the filesystem; optional caller label or an empty string in transport mode.                      |
| `activity`       | `"unverified"`                        | Required | Always unverified: filesystem inventory alone cannot prove that retained resources are inactive.                                            |
| `git`            | `WorkspaceGitInspection \| undefined` | Optional | Git worktree state report, present when Git inspection was requested.                                                                       |
| `locks`          | `LockInspection \| undefined`         | Optional | Local lock ownership report, present when lock inspection was requested.                                                                    |
| `resources`      | `ResourceInspection \| undefined`     | Optional | Sandbox activity report when requested; remote record ownership is always unverified.                                                       |
| `root`           | `string`                              | Required | Inspected local runtime root, or the logical marker transport for an object inventory.                                                      |
| `categories`     | `readonly StorageCategory[]`          | Required | Local recovery, logs, locks and workspaces, or transport artifacts, checkpoints, conversations, recovery, logs, reservations and resources. |
| `usage`          | `Readonly<StorageUsage>`              | Required | Observed storage bytes and counts of files, directories, symbolic links and other entries.                                                  |
| `issues`         | `readonly StorageIssue[]`             | Required | Filesystem, Git or ownership problems that prevented complete inspection.                                                                   |
| `complete`       | `boolean`                             | Required | Whether all requested inspection work completed without hitting scan limits or inaccessible entries.                                        |
| `scannedEntries` | `number`                              | Required | Number of filesystem entries visited within the inspection bound.                                                                           |
| `maxEntries`     | `number`                              | Required | Maximum filesystem entries inspected before marking the inventory incomplete.                                                               |

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
