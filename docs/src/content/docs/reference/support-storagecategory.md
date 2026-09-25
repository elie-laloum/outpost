---
title: "StorageCategory"
description: "StorageCategory — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name      | Type                      | Presence | Meaning                                                       |
| --------- | ------------------------- | -------- | ------------------------------------------------------------- |
| `name`    | `StorageCategoryName`     | Required | Managed storage category represented by this inventory group. |
| `path`    | `string`                  | Required | Host directory containing this managed storage category.      |
| `entries` | `readonly StorageEntry[]` | Required | Inspected filesystem entries within this storage category.    |

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
