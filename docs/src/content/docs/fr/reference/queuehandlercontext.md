---
title: "QueueHandlerContext"
description: "QueueHandlerContext — Outpost API"
sidebar:
  order: 10
---

Contrat public de **QueueHandlerContext**. Consultez le [guide exécution distribuée](../../workflows/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { QueueHandlerContext } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface QueueHandlerContext {
  readonly signal: AbortSignal;
  readonly job: QueueJob;
}
```

## Contrats associés

- [QueueJob](../queuejob/)
