---
title: "QueueClaim"
description: "QueueClaim — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueueClaim**. See the [distributed execution guide](../../workflows/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueueClaim } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface QueueClaim {
  readonly worker: string;
  readonly handlers: readonly string[];
  readonly leaseMs: number;
}
```
