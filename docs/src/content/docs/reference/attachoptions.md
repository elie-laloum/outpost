---
title: "AttachOptions"
description: "AttachOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **AttachOptions**. See the [commands and terminal guide](../../guide/environment/commands/) for behavior, defaults and examples.

## Import

```ts
import type { AttachOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Run a process or attach a native interactive agent session with explicit stream ownership.

Command returns nonzero exit statuses; callers must check them. Attach requires a supported interactive provider. Vercel rejects attachment.

[Complete example and detailed rules](../../guide/environment/commands/).

## Parameters and properties

| Name           | Type                                                                                                 | Presence | Meaning                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `ask`          | `VariableQuestion \| undefined`                                                                      | Optional | See the linked contract and this family's rules for its interpretation. |
| `agent`        | `AgentAdapter \| undefined`                                                                          | Optional | Native coding-agent adapter.                                            |
| `brief`        | `Brief \| undefined`                                                                                 | Optional | Literal text or file-based task input.                                  |
| `continuation` | `{ readonly id: string; readonly fork?: boolean; } \| undefined`                                     | Optional | See the linked contract and this family's rules for its interpretation. |
| `signal`       | `AbortSignal \| undefined`                                                                           | Optional | Cooperative cancellation for this operation.                            |
| `terminal`     | `{ readonly input?: Readable; readonly output?: Writable; readonly error?: Writable; } \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

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
