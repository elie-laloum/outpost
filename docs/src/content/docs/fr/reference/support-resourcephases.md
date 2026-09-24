---
title: "resourcePhases"
description: "resourcePhases — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Signature

```ts
export declare const resourcePhases: readonly [
  "allocating",
  "ready",
  "closing",
  "cleanup-failed",
  "allocation-uncertain",
];
```
