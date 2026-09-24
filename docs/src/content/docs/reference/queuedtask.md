---
title: "queuedTask"
description: "queuedTask — Outpost API"
sidebar:
  order: 10
---

Public contract for **queuedTask**. See the [distributed execution guide](../../workflows/distributed/) for behavior, defaults and examples.

## Import

```ts
import { queuedTask } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function queuedTask<T>(options: QueuedTaskOptions<T>): Task<T>;
```

## Related contracts

- [QueuedTaskOptions](../queuedtaskoptions/)
- [Task](../task/)
