---
title: "isolatedTask"
description: "isolatedTask — Outpost API"
sidebar:
  order: 10
---

Contrat public de **isolatedTask**. Consultez le [guide workflows](../../workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { isolatedTask } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function isolatedTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform"> &
    IsolatedTaskOptions<T>,
): Task<DispatchResult<T>>;
```

## Contrats associés

- [DispatchResult](../dispatchresult/)
- [IsolatedTaskOptions](../support-isolatedtaskoptions/)
- [Task](../task/)
- [TaskOptions](../taskoptions/)
