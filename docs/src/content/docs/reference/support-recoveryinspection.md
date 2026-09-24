---
title: "RecoveryInspection"
description: "RecoveryInspection — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Signature

```ts
export interface RecoveryInspection extends StorageInventory {
  readonly repository: string;
  readonly activity: "unverified";
  readonly git?: WorkspaceGitInspection;
  readonly locks?: LockInspection;
}
```

## Related contracts

- [LockInspection](../support-lockinspection/)
- [StorageInventory](../support-storageinventory/)
- [WorkspaceGitInspection](../support-workspacegitinspection/)
