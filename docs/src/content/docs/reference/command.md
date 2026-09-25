---
title: "Command"
description: "Command — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Command } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                                                                                 | Presence | Meaning                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `executable`  | `string`                                                                                             | Required | Program to execute without implicit shell parsing.                                        |
| `arguments`   | `readonly string[] \| undefined`                                                                     | Optional | Arguments passed directly to the executable.                                              |
| `stdin`       | `string \| undefined`                                                                                | Optional | Input supplied to the process.                                                            |
| `directory`   | `string \| undefined`                                                                                | Optional | Working directory inside the execution environment; defaults to its workspace root.       |
| `variables`   | `Readonly<Record<string, string>> \| undefined`                                                      | Optional | Explicit environment declarations; values are strings.                                    |
| `signal`      | `AbortSignal \| undefined`                                                                           | Optional | Cooperative cancellation for this operation.                                              |
| `deadlineMs`  | `number \| undefined`                                                                                | Optional | Maximum operation duration in milliseconds before terminating the command or transfer.    |
| `interactive` | `boolean \| undefined`                                                                               | Optional | Request an interactive agent invocation or process terminal.                              |
| `terminal`    | `{ readonly input?: Readable; readonly output?: Writable; readonly error?: Writable; } \| undefined` | Optional | Input, output and error streams for real interactive terminal attachment.                 |
| `elevated`    | `boolean \| undefined`                                                                               | Optional | Request elevated execution from a provider that supports it.                              |
| `retain`      | `number \| undefined`                                                                                | Optional | Maximum retained tail per output stream, in bytes.                                        |
| `observe`     | `((channel: Channel, text: string) => void) \| undefined`                                            | Optional | Receive streamed stdout/stderr chunks with their channel; observer failures are isolated. |

## Signature

```ts
import type { Readable, Writable } from "node:stream";

export interface Command {
  readonly executable: string;
  readonly arguments?: readonly string[];
  readonly stdin?: string;
  readonly directory?: string;
  readonly variables?: Variables;
  readonly signal?: AbortSignal;
  readonly deadlineMs?: number;
  readonly interactive?: boolean;
  readonly terminal?: {
    readonly input?: Readable;
    readonly output?: Writable;
    readonly error?: Writable;
  };
  readonly elevated?: boolean;
  readonly retain?: number;
  readonly observe?: (channel: Channel, text: string) => void;
}
```

## Related contracts

- [Channel](../channel/)
- [Variables](../variables/)
