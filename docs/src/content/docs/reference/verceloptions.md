---
title: "VercelOptions"
description: "VercelOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **VercelOptions**. See the [providers guide](../../providers/overview/) for behavior, defaults and examples.

## Import

```ts
import type { VercelOptions } from "@elie-laloum/outpost/providers/vercel";
```

## Signature

```ts
import type { Sandbox } from "@vercel/sandbox";

export interface VercelOptions {
  readonly create?: NonNullable<Parameters<typeof Sandbox.create>[0]>;
  readonly variables?: Variables;
  readonly root?: string;
  readonly retain?: number;
}
```

## Related contracts

- [Variables](../variables/)
