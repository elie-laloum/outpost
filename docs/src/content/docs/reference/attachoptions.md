---
title: "AttachOptions"
description: "AttachOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AttachOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                                                                                                 | Presence | Meaning                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `ask`          | `VariableQuestion \| undefined`                                                                      | Optional | Callback that supplies missing brief variables during interactive attachment.              |
| `agent`        | `AgentAdapter \| undefined`                                                                          | Optional | Native coding-agent adapter.                                                               |
| `brief`        | `Brief \| undefined`                                                                                 | Optional | Literal text or file-based task input.                                                     |
| `continuation` | `{ readonly id: string; readonly fork?: boolean; } \| undefined`                                     | Optional | Native conversation ID to continue; fork requests a separate conversation derived from it. |
| `signal`       | `AbortSignal \| undefined`                                                                           | Optional | Cooperative cancellation for this operation.                                               |
| `terminal`     | `{ readonly input?: Readable; readonly output?: Writable; readonly error?: Writable; } \| undefined` | Optional | Input, output and error streams for real interactive terminal attachment.                  |

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
