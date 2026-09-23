---
title: "Command"
description: "Command — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Command**. Consultez le [guide commandes et terminal](../../sandboxes/commands/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Command } from "@elie-laloum/outpost";
```

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

## Contrats associés

- [Channel](../channel/)
- [Variables](../variables/)
