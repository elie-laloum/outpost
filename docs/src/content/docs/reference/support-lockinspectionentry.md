---
title: "LockInspectionEntry"
description: "LockInspectionEntry — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Signature

```ts
export type LockInspectionEntry = Pick<StorageEntry, "name" | "path"> &
  LockInspectionState;
```

## Related contracts

- [LockInspectionState](../support-lockinspectionstate/)
- [StorageEntry](../support-storageentry/)
