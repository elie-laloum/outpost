---
title: "StorageInventory"
description: "StorageInventory — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom              | Type                         | Présence | Rôle                                                                                                  |
| ---------------- | ---------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `root`           | `string`                     | Requis   | Dossier .outpost local au dépôt dont le stockage a été inspecté.                                      |
| `categories`     | `readonly StorageCategory[]` | Requis   | Stockage regroupé en récupération, journaux, verrous et workspaces.                                   |
| `usage`          | `Readonly<StorageUsage>`     | Requis   | Octets de stockage observés et nombres de fichiers, dossiers, liens symboliques et autres entrées.    |
| `issues`         | `readonly StorageIssue[]`    | Requis   | Problèmes de fichiers, Git ou possession ayant empêché une inspection complète.                       |
| `complete`       | `boolean`                    | Requis   | Indique si toute l’inspection demandée s’est terminée sans limite de parcours ni entrée inaccessible. |
| `scannedEntries` | `number`                     | Requis   | Nombre d’entrées de fichiers visitées dans la limite d’inspection.                                    |
| `maxEntries`     | `number`                     | Requis   | Nombre maximal d’entrées de fichiers inspectées avant de déclarer l’inventaire incomplet.             |

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

## Contrats associés

- [StorageCategory](../support-storagecategory/)
- [StorageIssue](../support-storageissue/)
- [StorageUsage](../support-storageusage/)
