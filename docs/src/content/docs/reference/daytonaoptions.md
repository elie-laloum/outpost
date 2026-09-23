---
title: "DaytonaOptions"
description: "DaytonaOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **DaytonaOptions**. See the [providers guide](../../providers/overview/) for behavior, defaults and examples.

## Import

```ts
import type { DaytonaOptions } from "@elie-laloum/outpost/providers/daytona";
```

## Signature

```ts
export interface DaytonaOptions {
  readonly connection?: DaytonaConfig;
  readonly create?:
    CreateSandboxFromImageParams | CreateSandboxFromSnapshotParams;
  readonly variables?: Variables;
  readonly root?: string;
  readonly retain?: number;
}
```

## Related contracts

- [Variables](../variables/)
