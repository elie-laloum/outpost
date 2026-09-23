---
title: "SandboxProvider"
description: "SandboxProvider — Outpost API"
sidebar:
  order: 10
---

Public contract for **SandboxProvider**. See the [providers guide](../../providers/overview/) for behavior, defaults and examples.

## Import

```ts
import type { SandboxProvider } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface SandboxProvider {
  readonly name: string;
  readonly placement: "mounted" | "remote" | "host";
  readonly variables?: Variables;
  acquire(context: SandboxContext): Promise<SandboxLease>;
}
```

## Related contracts

- [SandboxContext](../sandboxcontext/)
- [SandboxLease](../sandboxlease/)
- [Variables](../variables/)
