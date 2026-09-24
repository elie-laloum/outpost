---
title: "sqliteTaskQueue"
description: "sqliteTaskQueue — Outpost API"
sidebar:
  order: 10
---

Public contract for **sqliteTaskQueue**. See the [distributed execution guide](../../workflows/distributed/) for behavior, defaults and examples.

## Import

```ts
import { sqliteTaskQueue } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function sqliteTaskQueue(
  path: string,
): Promise<DurableTaskQueue>;
```

## Related contracts

- [DurableTaskQueue](../durabletaskqueue/)
