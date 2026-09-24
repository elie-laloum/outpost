---
title: "RecoveryInspection"
description: "RecoveryInspection — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryInspection**. See the [resource activity guide](../../operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryInspection } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryInspection extends StorageInventory {
  readonly repository: string;
  readonly activity: "unverified";
  readonly git?: WorkspaceGitInspection;
  readonly locks?: LockInspection;
  readonly resources?: ResourceInspection;
}
```

## Related contracts

- [LockInspection](../support-lockinspection/)
- [ResourceInspection](../resourceinspection/)
- [StorageInventory](../support-storageinventory/)
- [WorkspaceGitInspection](../support-workspacegitinspection/)
