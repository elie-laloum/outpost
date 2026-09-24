---
title: "DurableTaskQueue"
description: "DurableTaskQueue — Outpost API"
sidebar:
  order: 10
---

Contrat public de **DurableTaskQueue**. Consultez le [guide exécution distribuée](../../workflows/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { DurableTaskQueue } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface DurableTaskQueue extends TaskQueue {
  close(): void;
}
```

## Contrats associés

- [TaskQueue](../taskqueue/)
