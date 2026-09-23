---
title: "ContinuationOptions"
description: "ContinuationOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **ContinuationOptions**. See the [dispatch guide](../../agents/dispatch/) for behavior, defaults and examples.

## Import

```ts
import type { ContinuationOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export type ContinuationOptions<T = undefined> = DispatchOptions<T> &
  Omit<SandboxOptions, "agent">;
```

## Related contracts

- [DispatchOptions](../dispatchoptions/)
- [SandboxOptions](../sandboxoptions/)
