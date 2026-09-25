---
title: "StorageInventory"
description: "StorageInventory — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name             | Type                         | Presence | Meaning                                                                                              |
| ---------------- | ---------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `root`           | `string`                     | Required | Repository-local .outpost directory whose storage was inspected.                                     |
| `categories`     | `readonly StorageCategory[]` | Required | Storage grouped into recovery, logs, locks and workspaces.                                           |
| `usage`          | `Readonly<StorageUsage>`     | Required | Observed storage bytes and counts of files, directories, symbolic links and other entries.           |
| `issues`         | `readonly StorageIssue[]`    | Required | Filesystem, Git or ownership problems that prevented complete inspection.                            |
| `complete`       | `boolean`                    | Required | Whether all requested inspection work completed without hitting scan limits or inaccessible entries. |
| `scannedEntries` | `number`                     | Required | Number of filesystem entries visited within the inspection bound.                                    |
| `maxEntries`     | `number`                     | Required | Maximum filesystem entries inspected before marking the inventory incomplete.                        |

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
