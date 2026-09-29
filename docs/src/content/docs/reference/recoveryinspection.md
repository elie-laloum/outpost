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

| Name             | Type                                  | Presence | Meaning                                                                                                                                                                                                               |
| ---------------- | ------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repository`     | `string`                              | Required | Top-level root of the inspected Git checkout in local mode. In transport mode, the repository option echoed back, or an empty string.                                                                                 |
| `activity`       | `"unverified"`                        | Required | Always unverified: neither files nor transport objects prove that retained resources are inactive.                                                                                                                    |
| `git`            | `WorkspaceGitInspection \| undefined` | Optional | Git worktree state report, present when Git inspection was requested.                                                                                                                                                 |
| `locks`          | `LockInspection \| undefined`         | Optional | Local lock ownership report, present when lock inspection was requested.                                                                                                                                              |
| `resources`      | `ResourceInspection \| undefined`     | Optional | Recorded sandbox activity, present when resources was true. Ownership is judged against the current process in local mode and always unknown in transport mode.                                                       |
| `root`           | `string`                              | Required | Inspected directory, the repository's .outpost, or transport for a transport inventory.                                                                                                                               |
| `categories`     | `readonly StorageCategory[]`          | Required | One group per category, listed even when empty: recovery, logs, locks, workspaces and storage locally; artifacts, checkpoints, conversations, recovery, logs, reservations, resources and task-cache for a transport. |
| `usage`          | `Readonly<StorageUsage>`              | Required | Observed storage bytes and counts of files, directories, symbolic links and other entries.                                                                                                                            |
| `issues`         | `readonly StorageIssue[]`             | Required | Entries that could not be fully inspected, each with a code such as ENTRY_LIMIT, DEPTH_LIMIT, UNSUPPORTED_TYPE or a filesystem error code.                                                                            |
| `complete`       | `boolean`                             | Required | true when the scan recorded no issue.                                                                                                                                                                                 |
| `scannedEntries` | `number`                              | Required | Entries visited, at most maxEntries: filesystem entries locally, listed objects for a transport.                                                                                                                      |
| `maxEntries`     | `number`                              | Required | Scan bound, default 100000. Reaching it records an ENTRY_LIMIT issue and makes the inventory incomplete.                                                                                                              |

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
