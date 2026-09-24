---
title: "runQueueWorker"
description: "runQueueWorker — Outpost API"
sidebar:
  order: 10
---

Contrat public de **runQueueWorker**. Consultez le [guide exécution distribuée](../../workflows/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { runQueueWorker } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function runQueueWorker(
  options: QueueWorkerOptions,
): Promise<void>;
```

## Contrats associés

- [QueueWorkerOptions](../queueworkeroptions/)
