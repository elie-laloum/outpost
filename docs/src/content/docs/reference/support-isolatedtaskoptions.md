---
title: "IsolatedTaskOptions"
description: "IsolatedTaskOptions — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Compose tasks with explicit dependency edges and typed result access.

Duplicate keys, missing dependencies and cycles fail validation. Failed or skipped dependencies skip descendants. Retries can repeat external effects. Unwrap throws on a non-successful result.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name      | Type                                                                                  | Presence | Meaning                                                                 |
| --------- | ------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `request` | `(context: TaskContext) => IsolatedTaskRequest<T> \| Promise<IsolatedTaskRequest<T>>` | Required | See the linked contract and this family's rules for its interpretation. |

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
