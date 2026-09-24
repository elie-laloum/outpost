---
title: "runQueueWorker"
description: "runQueueWorker — Outpost API"
sidebar:
  order: 10
---

Public contract for **runQueueWorker**. See the [distributed execution guide](../../workflows/distributed/) for behavior, defaults and examples.

## Import

```ts
import { runQueueWorker } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function runQueueWorker(
  options: QueueWorkerOptions,
): Promise<void>;
```

## Related contracts

- [QueueWorkerOptions](../queueworkeroptions/)
