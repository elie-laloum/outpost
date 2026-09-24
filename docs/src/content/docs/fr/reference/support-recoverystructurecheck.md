---
title: "RecoveryStructureCheck"
description: "RecoveryStructureCheck — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Signature

```ts
export interface RecoveryStructureCheck {
  readonly path: string;
  readonly status: "pass" | "fail";
  readonly code: string;
}
```
