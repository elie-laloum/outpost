---
title: "LockInspection"
description: "LockInspection — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Signature

```ts
export interface LockInspection {
  readonly complete: boolean;
  readonly scope: "local-pid";
  readonly entries: readonly LockInspectionEntry[];
  readonly issues: readonly StorageIssue[];
}
```

## Contrats associés

- [LockInspectionEntry](../support-lockinspectionentry/)
- [StorageIssue](../support-storageissue/)
