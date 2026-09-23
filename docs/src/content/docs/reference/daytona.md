---
title: "daytona"
description: "daytona — Outpost API"
sidebar:
  order: 10
---

Public contract for **daytona**. See the [providers guide](../../providers/overview/) for behavior, defaults and examples.

## Import

```ts
import { daytona } from "@elie-laloum/outpost/providers/daytona";
```

## Signature

```ts
export declare function daytona(
  options?: DaytonaOptions,
  connect?: (
    config?: DaytonaConfig,
  ) => Promise<Pick<Daytona, "create" | "delete">>,
): SandboxProvider;
```

## Related contracts

- [DaytonaOptions](../daytonaoptions/)
- [SandboxProvider](../sandboxprovider/)
