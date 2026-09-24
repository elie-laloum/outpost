---
title: "QueueClaim"
description: "QueueClaim — Outpost API"
sidebar:
  order: 10
---

Contrat public de **QueueClaim**. Consultez le [guide exécution distribuée](../../workflows/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { QueueClaim } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface QueueClaim {
  readonly worker: string;
  readonly handlers: readonly string[];
  readonly leaseMs: number;
}
```
