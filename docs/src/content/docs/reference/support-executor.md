---
title: "Executor"
description: "Executor — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Signature

```ts
export type Executor = (command: Command) => Promise<CommandResult>;
```

## Related contracts

- [Command](../command/)
- [CommandResult](../commandresult/)
