---
title: "TaskOptions"
description: "TaskOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **TaskOptions**. Consultez le [guide workflows](../../workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { TaskOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export type TaskOptions<T> = Omit<Task<T>, "after"> & {
  readonly after?: readonly Task[];
};
```

## Contrats associés

- [Task](../task/)
