---
title: "CommandTaskOptions"
description: "CommandTaskOptions — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Signature

```ts
export type CommandTaskOptions = {
  sandbox: Sandbox;
  command: Command | ((context: TaskContext) => Command);
};
```

## Related contracts

- [Command](../command/)
- [Sandbox](../sandbox/)
- [TaskContext](../taskcontext/)
