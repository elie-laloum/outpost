---
title: "vercel"
description: "vercel — Outpost API"
sidebar:
  order: 10
---

Public contract for **vercel**. See the [providers guide](../../providers/overview/) for behavior, defaults and examples.

## Import

```ts
import { vercel } from "@elie-laloum/outpost/providers/vercel";
```

## Signature

```ts
import type { Sandbox } from "@vercel/sandbox";

export declare function vercel(
  options?: VercelOptions,
  connect?: (config: VercelOptions["create"]) => Promise<Sandbox>,
): SandboxProvider;
```

## Related contracts

- [SandboxProvider](../sandboxprovider/)
- [VercelOptions](../verceloptions/)
