---
title: "StorageInventory"
description: "StorageInventory — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name             | Type                         | Presence | Meaning                                                                                                                                     |
| ---------------- | ---------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`           | `string`                     | Required | Inspected local runtime root, or the logical marker transport for an object inventory.                                                      |
| `categories`     | `readonly StorageCategory[]` | Required | Local recovery, logs, locks and workspaces, or transport artifacts, checkpoints, conversations, recovery, logs, reservations and resources. |
| `usage`          | `Readonly<StorageUsage>`     | Required | Observed storage bytes and counts of files, directories, symbolic links and other entries.                                                  |
| `issues`         | `readonly StorageIssue[]`    | Required | Filesystem, Git or ownership problems that prevented complete inspection.                                                                   |
| `complete`       | `boolean`                    | Required | Whether all requested inspection work completed without hitting scan limits or inaccessible entries.                                        |
| `scannedEntries` | `number`                     | Required | Number of filesystem entries visited within the inspection bound.                                                                           |
| `maxEntries`     | `number`                     | Required | Maximum filesystem entries inspected before marking the inventory incomplete.                                                               |

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
