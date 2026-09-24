---
title: "IsolatedTaskOptions"
description: "IsolatedTaskOptions — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Signature

```ts
export type IsolatedTaskOptions<T> = {
  request: (
    context: TaskContext,
  ) => IsolatedTaskRequest<T> | Promise<IsolatedTaskRequest<T>>;
};
```

## Related contracts

- [IsolatedTaskRequest](../support-isolatedtaskrequest/)
- [TaskContext](../taskcontext/)
