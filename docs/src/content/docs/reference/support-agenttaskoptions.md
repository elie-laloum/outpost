---
title: "AgentTaskOptions"
description: "AgentTaskOptions — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

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
