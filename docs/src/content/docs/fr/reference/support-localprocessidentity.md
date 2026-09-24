---
title: "LocalProcessIdentity"
description: "LocalProcessIdentity — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Signature

```ts
export interface LocalProcessIdentity {
  readonly host: string;
  readonly boot: string;
  readonly namespace: string;
  readonly started: string;
}
```
