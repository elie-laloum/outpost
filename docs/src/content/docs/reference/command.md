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

| Name          | Type                                                                                                 | Presence | Meaning                                                                                                                                                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `executable`  | `string`                                                                                             | Required | Program to execute without implicit shell parsing.                                                                                                                                                                                                       |
| `arguments`   | `readonly string[] \| undefined`                                                                     | Optional | Arguments passed as-is, without shell expansion.                                                                                                                                                                                                         |
| `stdin`       | `string \| undefined`                                                                                | Optional | Text written to standard input, which then closes unless input is set.                                                                                                                                                                                   |
| `input`       | `Readable \| undefined`                                                                              | Optional | Readable stream written to stdin after stdin; standard input stays open until the stream ends. Vercel and Daytona relay its chunks through an append-only file in the sandbox.                                                                           |
| `directory`   | `string \| undefined`                                                                                | Optional | Working directory inside the sandbox, default sandbox.root.                                                                                                                                                                                              |
| `variables`   | `Readonly<Record<string, string>> \| undefined`                                                      | Optional | Environment variables for this command only, added over the provider's variables. Docker, Podman and Firecracker reject names that are not shell identifiers with code configuration.                                                                    |
| `signal`      | `AbortSignal \| undefined`                                                                           | Optional | Aborting it stops the process group and rejects the command with the signal's reason. The sandbox stays open.                                                                                                                                            |
| `deadlineMs`  | `number \| undefined`                                                                                | Optional | Maximum duration in milliseconds, default 600000 (10 minutes). Past it the process group is stopped and the command rejects with code timeout, or with a TimeoutError on Vercel and Daytona.                                                             |
| `interactive` | `boolean \| undefined`                                                                               | Optional | Runs the process on a terminal: the host terminal, or the terminal streams when given. Docker and Podman allocate a TTY only when the host stdin is one, Daytona opens a PTY, Vercel rejects with code provider and Firecracker with code configuration. |
| `terminal`    | `{ readonly input?: Readable; readonly output?: Writable; readonly error?: Writable; } \| undefined` | Optional | Streams connected instead of the host terminal: input feeds stdin in place of stdin and input, output and error receive the process output, which the result also keeps. Outpost does not end these streams.                                             |
| `elevated`    | `boolean \| undefined`                                                                               | Optional | Runs the command as root: user 0:0 on Docker and Podman, sudo on Vercel and Daytona. Firecracker rejects it with code configuration; the local provider ignores it.                                                                                      |
| `retain`      | `number \| undefined`                                                                                | Optional | Trailing characters of each stream kept in the result, default 65536 or the provider's retain option. observe still receives the whole output.                                                                                                           |
| `observe`     | `((channel: Channel, text: string) => void) \| undefined`                                            | Optional | Receives each stdout or stderr chunk as decoded text while the process runs. An exception thrown here stops the command, which rejects with it; a Daytona terminal ignores it.                                                                           |

## Signature

```ts
import type { Readable, Writable } from "node:stream";

export interface Command {
  readonly executable: string;
  readonly arguments?: readonly string[];
  readonly stdin?: string;
  /** Live stdin written after `stdin`; stdin closes when this stream ends. */
  readonly input?: Readable;
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
