---
title: "StorageInventory"
description: "StorageInventory — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

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
