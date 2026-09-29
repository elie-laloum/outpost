---
title: "StorageInventory"
description: "StorageInventory — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name             | Type                         | Presence | Meaning                                                                                                                                                                                                               |
| ---------------- | ---------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`           | `string`                     | Required | Inspected directory, the repository's .outpost, or transport for a transport inventory.                                                                                                                               |
| `categories`     | `readonly StorageCategory[]` | Required | One group per category, listed even when empty: recovery, logs, locks, workspaces and storage locally; artifacts, checkpoints, conversations, recovery, logs, reservations, resources and task-cache for a transport. |
| `usage`          | `Readonly<StorageUsage>`     | Required | Observed storage bytes and counts of files, directories, symbolic links and other entries.                                                                                                                            |
| `issues`         | `readonly StorageIssue[]`    | Required | Entries that could not be fully inspected, each with a code such as ENTRY_LIMIT, DEPTH_LIMIT, UNSUPPORTED_TYPE or a filesystem error code.                                                                            |
| `complete`       | `boolean`                    | Required | true when the scan recorded no issue.                                                                                                                                                                                 |
| `scannedEntries` | `number`                     | Required | Entries visited, at most maxEntries: filesystem entries locally, listed objects for a transport.                                                                                                                      |
| `maxEntries`     | `number`                     | Required | Scan bound, default 100000. Reaching it records an ENTRY_LIMIT issue and makes the inventory incomplete.                                                                                                              |

## Signature

```ts
export interface StorageInventory {
  readonly root: string;
  readonly categories: readonly StorageCategory[];
  readonly usage: Readonly<StorageUsage>;
  readonly issues: readonly StorageIssue[];
  readonly complete: boolean;
  readonly scannedEntries: number;
  readonly maxEntries: number;
}
```

## Related contracts

- [StorageCategory](../support-storagecategory/)
- [StorageIssue](../support-storageissue/)
- [StorageUsage](../support-storageusage/)
