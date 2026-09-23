---
title: "dispatch"
description: "dispatch — Outpost API"
sidebar:
  order: 10
---

Public contract for **dispatch**. See the [dispatch guide](../../agents/dispatch/) for behavior, defaults and examples.

## Import

```ts
import { dispatch } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function dispatch<T = undefined>(
  options: SandboxOptions & DispatchOptions<T> & RequiredAgent,
): Promise<DispatchResult<T>>;
```

## Related contracts

- [DispatchOptions](../dispatchoptions/)
- [DispatchResult](../dispatchresult/)
- [RequiredAgent](../support-requiredagent/)
- [SandboxOptions](../sandboxoptions/)
