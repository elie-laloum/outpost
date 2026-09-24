---
title: "QueueServerOptions"
description: "QueueServerOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueueServerOptions**. See the [distributed execution guide](../../workflows/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueueServerOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface QueueServerOptions {
  readonly queue: TaskQueue;
  readonly token: string;
  readonly host?: string;
  readonly port?: number;
}
```

## Related contracts

- [TaskQueue](../taskqueue/)
