---
title: "QueueHandlerContext"
description: "QueueHandlerContext — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueueHandlerContext**. See the [distributed execution guide](../../workflows/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueueHandlerContext } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface QueueHandlerContext {
  readonly signal: AbortSignal;
  readonly job: QueueJob;
}
```

## Related contracts

- [QueueJob](../queuejob/)
