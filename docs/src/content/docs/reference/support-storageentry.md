---
title: "StorageEntry"
description: "StorageEntry — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

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

## Related contracts

- [StorageEntryKind](../support-storageentrykind/)
- [StorageUsage](../support-storageusage/)
