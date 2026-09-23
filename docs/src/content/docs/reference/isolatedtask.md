---
title: "isolatedTask"
description: "isolatedTask — Outpost API"
sidebar:
  order: 10
---

Public contract for **isolatedTask**. See the [workflows guide](../../workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import { isolatedTask } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function isolatedTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform"> &
    IsolatedTaskOptions<T>,
): Task<DispatchResult<T>>;
```

## Related contracts

- [DispatchResult](../dispatchresult/)
- [IsolatedTaskOptions](../support-isolatedtaskoptions/)
- [Task](../task/)
- [TaskOptions](../taskoptions/)
