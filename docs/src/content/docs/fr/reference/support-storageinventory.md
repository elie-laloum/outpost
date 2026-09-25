---
title: "StorageInventory"
description: "StorageInventory — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Inspecter le travail conservé et planifier explicitement sa rétention sans abandonner les modifications récupérables.

Planifier ne supprime rien. L’application reprend possession et revalide les candidats. Les quotas observent l’usage plutôt que d’imposer une limite physique au système de fichiers.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom              | Type                         | Présence | Rôle                                                                             |
| ---------------- | ---------------------------- | -------- | -------------------------------------------------------------------------------- |
| `root`           | `string`                     | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `categories`     | `readonly StorageCategory[]` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `usage`          | `Readonly<StorageUsage>`     | Requis   | Compteurs d’usage rapportés ; aucune estimation monétaire.                       |
| `issues`         | `readonly StorageIssue[]`    | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `complete`       | `boolean`                    | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `scannedEntries` | `number`                     | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `maxEntries`     | `number`                     | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
