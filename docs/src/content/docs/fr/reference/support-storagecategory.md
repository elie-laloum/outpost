---
title: "StorageCategory"
description: "StorageCategory — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom       | Type                      | Présence | Rôle                                                                                                                                |
| --------- | ------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `StorageCategoryName`     | Requis   | Catégorie, qui est aussi son nom de dossier sous .outpost ou son préfixe de clé dans le transport.                                  |
| `path`    | `string`                  | Requis   | Dossier hôte de la catégorie, ou son préfixe de clé pour un inventaire de transport.                                                |
| `entries` | `readonly StorageEntry[]` | Requis   | Enfants directs du dossier de la catégorie, triés par nom, chacun avec ses propres totaux ; une entrée par objet pour un transport. |

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
