---
title: "IsolatedTaskRequest"
description: "IsolatedTaskRequest — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Signature

```ts
export type IsolatedTaskRequest<T> = SandboxOptions &
  DispatchOptions<T> & {
    readonly agent: AgentAdapter;
  };
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
- [DispatchOptions](../dispatchoptions/)
- [SandboxOptions](../sandboxoptions/)
