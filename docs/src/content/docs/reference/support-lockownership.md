---
title: "LockOwnership"
description: "LockOwnership — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Signature

```ts
export interface LockOwnership {
  readonly status: "active" | "inactive" | "unknown";
  readonly reason: string;
}
```
