---
title: "IsolatedTaskOptions"
description: "IsolatedTaskOptions — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

| Name      | Type                                                                                  | Presence | Meaning                                                                                                  |
| --------- | ------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `request` | `(context: TaskContext) => IsolatedTaskRequest<T> \| Promise<IsolatedTaskRequest<T>>` | Required | Build repository, provider, agent and brief options for a separately allocated dispatch at each attempt. |

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
