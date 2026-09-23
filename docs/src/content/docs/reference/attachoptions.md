---
title: "AttachOptions"
description: "AttachOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **AttachOptions**. See the [commands and terminal guide](../../sandboxes/commands/) for behavior, defaults and examples.

## Import

```ts
import type { AttachOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface AttachOptions {
  readonly ask?: VariableQuestion;
  readonly agent?: AgentAdapter;
  readonly brief?: Brief;
  readonly continuation?: {
    readonly id: string;
    readonly fork?: boolean;
  };
  readonly signal?: AbortSignal;
  readonly terminal?: Command["terminal"];
}
```

## Related contracts

- [AgentAdapter](../agentadapter/)
- [Brief](../brief/)
- [Command](../command/)
- [VariableQuestion](../variablequestion/)
