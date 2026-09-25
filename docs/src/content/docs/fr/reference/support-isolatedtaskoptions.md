---
title: "IsolatedTaskOptions"
description: "IsolatedTaskOptions — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

| Nom       | Type                                                                                  | Présence | Rôle                                                                                                            |
| --------- | ------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `request` | `(context: TaskContext) => IsolatedTaskRequest<T> \| Promise<IsolatedTaskRequest<T>>` | Requis   | Construit les options de dépôt, provider, agent et brief pour un dispatch alloué séparément à chaque tentative. |

## Signature

```ts
export type IsolatedTaskOptions<T> = {
  request: (
    context: TaskContext,
  ) => IsolatedTaskRequest<T> | Promise<IsolatedTaskRequest<T>>;
};
```

## Contrats associés

- [IsolatedTaskRequest](../support-isolatedtaskrequest/)
- [TaskContext](../taskcontext/)
