---
title: "IsolatedTaskOptions"
description: "IsolatedTaskOptions — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

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
