---
title: "StorageCategory"
description: "StorageCategory — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom       | Type                      | Présence | Rôle                                                               |
| --------- | ------------------------- | -------- | ------------------------------------------------------------------ |
| `name`    | `StorageCategoryName`     | Requis   | Catégorie de stockage géré représentée par ce groupe d’inventaire. |
| `path`    | `string`                  | Requis   | Dossier hôte contenant cette catégorie de stockage géré.           |
| `entries` | `readonly StorageEntry[]` | Requis   | Entrées de fichiers inspectées dans cette catégorie de stockage.   |

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
