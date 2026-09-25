---
title: "AgentTaskOptions"
description: "AgentTaskOptions — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

| Name      | Type                                           | Presence | Meaning                                                                       |
| --------- | ---------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `sandbox` | `Sandbox`                                      | Required | Existing caller-owned sandbox reused by the task; the task does not close it. |
| `request` | `(context: TaskContext) => DispatchOptions<T>` | Required | Build dispatch options from task dependencies for the existing sandbox.       |

## Signature

```ts
export type AgentTaskOptions<T> = {
  sandbox: Sandbox;
  request: (context: TaskContext) => DispatchOptions<T>;
};
```

## Related contracts

- [DispatchOptions](../dispatchoptions/)
- [Sandbox](../sandbox/)
- [TaskContext](../taskcontext/)
