---
title: "StorageUsage"
description: "StorageUsage — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

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
