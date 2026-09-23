---
title: "vercel"
description: "vercel — Outpost API"
sidebar:
  order: 10
---

Contrat public de **vercel**. Consultez le [guide providers](../../providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [SandboxProvider](../sandboxprovider/)
- [VercelOptions](../verceloptions/)
