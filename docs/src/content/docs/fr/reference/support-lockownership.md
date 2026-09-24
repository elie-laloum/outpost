---
title: "LockOwnership"
description: "LockOwnership — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Signature

```ts
export interface LockOwnership {
  readonly status: "active" | "inactive" | "unknown";
  readonly reason: string;
}
```
