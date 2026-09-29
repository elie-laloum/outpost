---
title: "StorageCategory"
description: "StorageCategory — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name      | Type                      | Presence | Meaning                                                                                                                    |
| --------- | ------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `StorageCategoryName`     | Required | Category, also its directory name under .outpost or its key prefix in the transport.                                       |
| `path`    | `string`                  | Required | Host directory of the category, or its key prefix for a transport inventory.                                               |
| `entries` | `readonly StorageEntry[]` | Required | Direct children of the category directory, sorted by name, each with its own totals; one entry per object for a transport. |

## Signature

```ts
export interface StorageCategory {
  readonly name: StorageCategoryName;
  readonly path: string;
  readonly entries: readonly StorageEntry[];
}
```

## Related contracts

- [StorageCategoryName](../support-storagecategoryname/)
- [StorageEntry](../support-storageentry/)
