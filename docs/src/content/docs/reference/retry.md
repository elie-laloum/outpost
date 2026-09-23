---
title: "Retry"
description: "Retry — Outpost API"
sidebar:
  order: 10
---

Public contract for **Retry**. See the [workflows guide](../../workflows/graph/) for behavior, defaults and examples.

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
