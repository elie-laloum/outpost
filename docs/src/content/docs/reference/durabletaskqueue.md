---
title: "DurableTaskQueue"
description: "DurableTaskQueue — Outpost API"
sidebar:
  order: 10
---

Public contract for **DurableTaskQueue**. See the [distributed execution guide](../../workflows/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { DurableTaskQueue } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface DurableTaskQueue extends TaskQueue {
  close(): void;
}
```

## Related contracts

- [TaskQueue](../taskqueue/)
