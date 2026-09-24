---
title: "QueueLease"
description: "QueueLease — Outpost API"
sidebar:
  order: 10
---

Contrat public de **QueueLease**. Consultez le [guide exécution distribuée](../../workflows/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { QueueLease } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface QueueLease {
  readonly id: string;
  readonly worker: string;
  readonly fence: number;
}
```
