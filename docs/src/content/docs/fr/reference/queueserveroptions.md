---
title: "QueueServerOptions"
description: "QueueServerOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **QueueServerOptions**. Consultez le [guide exécution distribuée](../../workflows/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { QueueServerOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface QueueServerOptions {
  readonly queue: TaskQueue;
  readonly token: string;
  readonly host?: string;
  readonly port?: number;
}
```

## Contrats associés

- [TaskQueue](../taskqueue/)
