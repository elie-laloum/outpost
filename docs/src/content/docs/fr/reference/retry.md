---
title: "Retry"
description: "Retry — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Retry**. Consultez le [guide workflows](../../workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Retry } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface Retry {
  readonly attempts: number;
  readonly delayMs?: number;
  readonly accepts?: (error: unknown, attempt: number) => boolean;
}
```
