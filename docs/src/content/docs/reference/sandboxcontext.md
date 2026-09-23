---
title: "SandboxContext"
description: "SandboxContext — Outpost API"
sidebar:
  order: 10
---

Public contract for **SandboxContext**. See the [providers guide](../../providers/overview/) for behavior, defaults and examples.

## Import

```ts
import type { SandboxContext } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface SandboxContext {
  readonly repository: string;
  readonly directory: string;
  readonly gitDirectories: readonly string[];
  readonly variables: Variables;
  readonly signal?: AbortSignal;
}
```

## Related contracts

- [Variables](../variables/)
