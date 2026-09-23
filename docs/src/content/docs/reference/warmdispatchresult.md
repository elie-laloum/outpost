---
title: "WarmDispatchResult"
description: "WarmDispatchResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **WarmDispatchResult**. See the [dispatch guide](../../agents/dispatch/) for behavior, defaults and examples.

## Import

```ts
import type { WarmDispatchResult } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WarmDispatchResult<T> extends Omit<
  DispatchResult<T>,
  "resume" | "fork"
> {
  resume<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<WarmDispatchResult<U>>;
  fork<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<WarmDispatchResult<U>>;
}
```

## Related contracts

- [DispatchOptions](../dispatchoptions/)
- [DispatchResult](../dispatchresult/)
