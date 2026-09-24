---
title: "StorageCategory"
description: "StorageCategory — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

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
