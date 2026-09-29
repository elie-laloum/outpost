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

| Name           | Type                                                                                                 | Presence | Meaning                                                                                                                                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ask`          | `VariableQuestion \| undefined`                                                                      | Optional | Answers each {{name}} variable a file brief leaves without a value, one call per name, before the terminal opens. Without it, Outpost asks on the host terminal and rejects with code configuration when stdin is not a TTY. |
| `agent`        | `Agent \| undefined`                                                                                 | Optional | CLI agent that opens in the terminal, replacing the sandbox's agent for this session. Built-in harness, replay and fallback agents reject with code configuration.                                                           |
| `brief`        | `Brief \| undefined`                                                                                 | Optional | First message given to the agent: literal text or a file brief. Without it, the terminal opens with no message.                                                                                                              |
| `continuation` | `{ readonly id: string; readonly fork?: boolean; } \| undefined`                                     | Optional | Native conversation to reopen, by id; fork: true opens a copy and leaves the original unchanged. Rejects with code configuration when the agent cannot resume or fork.                                                       |
| `signal`       | `AbortSignal \| undefined`                                                                           | Optional | Aborting it stops the agent process and rejects the attach with the signal's reason.                                                                                                                                         |
| `terminal`     | `{ readonly input?: Readable; readonly output?: Writable; readonly error?: Writable; } \| undefined` | Optional | Streams used instead of the host terminal: input feeds the agent, output and error receive what it writes. Omitted, the agent reads and writes the host process's stdin and stdout.                                          |

## Signature

```ts
export interface AttachOptions {
  readonly ask?: VariableQuestion;
  readonly agent?: Agent;
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

- [Agent](../type-agent/)
- [Brief](../brief/)
- [Command](../command/)
- [VariableQuestion](../variablequestion/)
