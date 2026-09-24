---
title: "queuedTask"
description: "queuedTask — Outpost API"
sidebar:
  order: 10
---

Contrat public de **queuedTask**. Consultez le [guide exécution distribuée](../../workflows/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { queuedTask } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function queuedTask<T>(options: QueuedTaskOptions<T>): Task<T>;
```

## Contrats associés

- [QueuedTaskOptions](../queuedtaskoptions/)
- [Task](../task/)
