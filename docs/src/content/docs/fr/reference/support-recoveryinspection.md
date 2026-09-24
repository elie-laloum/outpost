---
title: "RecoveryInspection"
description: "RecoveryInspection — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Signature

```ts
export interface RecoveryInspection extends StorageInventory {
  readonly repository: string;
  readonly activity: "unverified";
  readonly git?: WorkspaceGitInspection;
  readonly locks?: LockInspection;
}
```

## Contrats associés

- [LockInspection](../support-lockinspection/)
- [StorageInventory](../support-storageinventory/)
- [WorkspaceGitInspection](../support-workspacegitinspection/)
