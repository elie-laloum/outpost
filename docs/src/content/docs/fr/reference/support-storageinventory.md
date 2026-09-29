---
title: "StorageInventory"
description: "StorageInventory — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom              | Type                         | Présence | Rôle                                                                                                                                                                                                                 |
| ---------------- | ---------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`           | `string`                     | Requis   | Dossier inspecté, le .outpost du dépôt, ou transport pour un inventaire de transport.                                                                                                                                |
| `categories`     | `readonly StorageCategory[]` | Requis   | Un groupe par catégorie, présent même vide : recovery, logs, locks, workspaces et storage en local ; artifacts, checkpoints, conversations, recovery, logs, reservations, resources et task-cache pour un transport. |
| `usage`          | `Readonly<StorageUsage>`     | Requis   | Octets de stockage observés et nombres de fichiers, dossiers, liens symboliques et autres entrées.                                                                                                                   |
| `issues`         | `readonly StorageIssue[]`    | Requis   | Entrées qui n’ont pas pu être entièrement inspectées, chacune avec un code tel que ENTRY_LIMIT, DEPTH_LIMIT, UNSUPPORTED_TYPE ou un code d’erreur du système de fichiers.                                            |
| `complete`       | `boolean`                    | Requis   | true lorsque le parcours n’a relevé aucun problème.                                                                                                                                                                  |
| `scannedEntries` | `number`                     | Requis   | Entrées visitées, au plus maxEntries : entrées du système de fichiers en local, objets listés pour un transport.                                                                                                     |
| `maxEntries`     | `number`                     | Requis   | Limite du parcours, 100000 par défaut. L’atteindre ajoute un problème ENTRY_LIMIT et rend l’inventaire incomplet.                                                                                                    |

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
