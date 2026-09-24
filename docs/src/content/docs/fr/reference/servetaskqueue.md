---
title: "serveTaskQueue"
description: "serveTaskQueue — Outpost API"
sidebar:
  order: 10
---

Contrat public de **serveTaskQueue**. Consultez le [guide exécution distribuée](../../workflows/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { serveTaskQueue } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function serveTaskQueue(
  options: QueueServerOptions,
): Promise<QueueServer>;
```

## Contrats associés

- [QueueServer](../queueserver/)
- [QueueServerOptions](../queueserveroptions/)
