---
title: "StorageCategory"
description: "StorageCategory — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Signature

```ts
export interface StorageCategory {
  readonly name: StorageCategoryName;
  readonly path: string;
  readonly entries: readonly StorageEntry[];
}
```

## Contrats associés

- [StorageCategoryName](../support-storagecategoryname/)
- [StorageEntry](../support-storageentry/)
