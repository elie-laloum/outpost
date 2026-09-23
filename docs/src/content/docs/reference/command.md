---
title: "Command"
description: "Command — Outpost API"
sidebar:
  order: 10
---

Public contract for **Command**. See the [commands and terminal guide](../../sandboxes/commands/) for behavior, defaults and examples.

## Import

```ts
import type { Command } from "@elie-laloum/outpost";
```

## Signature

```ts
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
