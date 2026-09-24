---
title: "LockInspection"
description: "LockInspection — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Signature

```ts
export interface LockInspection {
  readonly complete: boolean;
  readonly scope: "local-pid";
  readonly entries: readonly LockInspectionEntry[];
  readonly issues: readonly StorageIssue[];
}
```

## Related contracts

- [LockInspectionEntry](../support-lockinspectionentry/)
- [StorageIssue](../support-storageissue/)
