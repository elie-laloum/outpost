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
  request: (context: TaskContext) => SandboxOptions &
    DispatchOptions<T> & {
      readonly agent: AgentAdapter;
    };
};
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
- [DispatchOptions](../dispatchoptions/)
- [SandboxOptions](../sandboxoptions/)
- [TaskContext](../taskcontext/)
