---
title: "DispatchResult"
description: "DispatchResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **DispatchResult**. See the [dispatch guide](../../agents/dispatch/) for behavior, defaults and examples.

## Import

```ts
import type { DispatchResult } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface DispatchResult<T> extends Execution<T> {
  readonly branch: string;
  readonly directory: string;
  readonly commits: readonly Commit[];
  readonly transcript?: string;
  readonly log?: string;
  readonly retainedDirectory?: string;
  resume<U = undefined>(
    options: ContinuationOptions<U>,
  ): Promise<DispatchResult<U>>;
  fork<U = undefined>(
    options: ContinuationOptions<U>,
  ): Promise<DispatchResult<U>>;
}
```

## Related contracts

- [Commit](../commit/)
- [ContinuationOptions](../continuationoptions/)
- [Execution](../execution/)
