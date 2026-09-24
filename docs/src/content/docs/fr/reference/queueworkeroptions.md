---
title: "QueueWorkerOptions"
description: "QueueWorkerOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **QueueWorkerOptions**. Consultez le [guide exécution distribuée](../../workflows/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { QueueWorkerOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface QueueWorkerOptions {
  readonly queue: TaskQueue;
  readonly worker: string;
  readonly handlers: Readonly<Record<string, QueueHandler>>;
  readonly signal: AbortSignal;
  readonly leaseMs?: number;
  readonly pollMs?: number;
}
```

## Contrats associés

- [QueueHandler](../queuehandler/)
- [TaskQueue](../taskqueue/)
