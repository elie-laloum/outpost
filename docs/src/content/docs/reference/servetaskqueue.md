---
title: "serveTaskQueue"
description: "serveTaskQueue — Outpost API"
sidebar:
  order: 10
---

Public contract for **serveTaskQueue**. See the [distributed execution guide](../../workflows/distributed/) for behavior, defaults and examples.

## Import

```ts
import { serveTaskQueue } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function serveTaskQueue(
  options: QueueServerOptions,
): Promise<QueueServer>;
```

## Related contracts

- [QueueServer](../queueserver/)
- [QueueServerOptions](../queueserveroptions/)
