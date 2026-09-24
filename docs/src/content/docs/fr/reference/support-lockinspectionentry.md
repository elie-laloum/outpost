---
title: "LockInspectionEntry"
description: "LockInspectionEntry — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Signature

```ts
export type LockInspectionEntry = Pick<StorageEntry, "name" | "path"> &
  LockInspectionState;
```

## Contrats associés

- [LockInspectionState](../support-lockinspectionstate/)
- [StorageEntry](../support-storageentry/)
