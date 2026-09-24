---
title: "StorageUsage"
description: "StorageUsage — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Signature

```ts
export interface StorageUsage {
  bytes: number;
  files: number;
  directories: number;
  symlinks: number;
  other: number;
}
```
