---
title: "QueueLease"
description: "QueueLease — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueueLease**. See the [distributed execution guide](../../workflows/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueueLease } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface QueueLease {
  readonly id: string;
  readonly worker: string;
  readonly fence: number;
}
```
