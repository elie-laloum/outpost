---
title: "StorageEntry"
description: "StorageEntry — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Signature

```ts
export interface StorageEntry extends StorageUsage {
  readonly name: string;
  readonly path: string;
  kind: StorageEntryKind;
  modifiedAt?: string;
  complete: boolean;
}
```

## Contrats associés

- [StorageEntryKind](../support-storageentrykind/)
- [StorageUsage](../support-storageusage/)
