---
title: "SandboxProvider"
description: "SandboxProvider — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SandboxProvider**. Consultez le [guide providers](../../providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [SandboxContext](../sandboxcontext/)
- [SandboxLease](../sandboxlease/)
- [Variables](../variables/)
