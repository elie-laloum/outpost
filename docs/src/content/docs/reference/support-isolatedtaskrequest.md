---
title: "IsolatedTaskRequest"
description: "IsolatedTaskRequest — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Signature

```ts
export type IsolatedTaskRequest<T> = SandboxOptions &
  DispatchOptions<T> & {
    readonly agent: AgentAdapter;
  };
```

## Related contracts

- [AgentAdapter](../agentadapter/)
- [DispatchOptions](../dispatchoptions/)
- [SandboxOptions](../sandboxoptions/)
