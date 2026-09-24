---
title: "sqliteTaskQueue"
description: "sqliteTaskQueue — Outpost API"
sidebar:
  order: 10
---

Contrat public de **sqliteTaskQueue**. Consultez le [guide exécution distribuée](../../workflows/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { sqliteTaskQueue } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function sqliteTaskQueue(
  path: string,
): Promise<DurableTaskQueue>;
```

## Contrats associés

- [DurableTaskQueue](../durabletaskqueue/)
