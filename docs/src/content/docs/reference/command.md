---
title: "Command"
description: "Command — Outpost API"
sidebar:
  order: 10
---

Public contract for **Command**. See the [commands and terminal guide](../../guide/environment/commands/) for behavior, defaults and examples.

## Import

```ts
import type { Command } from "@elie-laloum/outpost";
```

## Purpose and behavior

Run a process or attach a native interactive agent session with explicit stream ownership.

Command returns nonzero exit statuses; callers must check them. Attach requires a supported interactive provider. Vercel rejects attachment.

[Complete example and detailed rules](../../guide/environment/commands/).

## Parameters and properties

| Name          | Type                                                                                                 | Presence | Meaning                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `executable`  | `string`                                                                                             | Required | Program to execute without implicit shell parsing.                      |
| `arguments`   | `readonly string[] \| undefined`                                                                     | Optional | Arguments passed directly to the executable.                            |
| `stdin`       | `string \| undefined`                                                                                | Optional | Input supplied to the process.                                          |
| `directory`   | `string \| undefined`                                                                                | Optional | Filesystem directory used by the owning operation; see path rules.      |
| `variables`   | `Readonly<Record<string, string>> \| undefined`                                                      | Optional | Explicit environment declarations; values are strings.                  |
| `signal`      | `AbortSignal \| undefined`                                                                           | Optional | Cooperative cancellation for this operation.                            |
| `deadlineMs`  | `number \| undefined`                                                                                | Optional | Hard operation deadline in milliseconds.                                |
| `interactive` | `boolean \| undefined`                                                                               | Optional | See the linked contract and this family's rules for its interpretation. |
| `terminal`    | `{ readonly input?: Readable; readonly output?: Writable; readonly error?: Writable; } \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `elevated`    | `boolean \| undefined`                                                                               | Optional | See the linked contract and this family's rules for its interpretation. |
| `retain`      | `number \| undefined`                                                                                | Optional | Maximum retained tail per output stream, in bytes.                      |
| `observe`     | `((channel: Channel, text: string) => void) \| undefined`                                            | Optional | Notification callback; observer failures are isolated.                  |

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
