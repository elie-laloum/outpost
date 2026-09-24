---
title: "RecoveryStructureCheck"
description: "RecoveryStructureCheck — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Signature

```ts
export interface RecoveryStructureCheck {
  readonly path: string;
  readonly status: "pass" | "fail";
  readonly code: string;
}
```
