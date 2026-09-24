---
title: "QueueWorkerOptions"
description: "QueueWorkerOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueueWorkerOptions**. See the [distributed execution guide](../../workflows/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueueWorkerOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface QueueWorkerOptions {
  readonly queue: TaskQueue;
  readonly worker: string;
  readonly handlers: Readonly<Record<string, QueueHandler>>;
  readonly signal: AbortSignal;
  readonly leaseMs?: number;
  readonly pollMs?: number;
}
```

## Related contracts

- [QueueHandler](../queuehandler/)
- [TaskQueue](../taskqueue/)
