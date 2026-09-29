---
title: "AgentInput"
description: "AgentInput — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentInput } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                                                             | Presence | Meaning                                                                                                                                                                                                            |
| -------------- | ---------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `text`         | `string \| undefined`                                            | Optional | Prepared prompt passed to the native agent CLI.                                                                                                                                                                    |
| `interactive`  | `boolean \| undefined`                                           | Optional | Request an interactive agent invocation or process terminal.                                                                                                                                                       |
| `liveInput`    | `boolean \| undefined`                                           | Optional | Request the adapter's liveInput protocol: encode the prompt with it on stdin and keep stdin open for further user messages. Outpost sets it only when the dispatch has steering and the lease supports live input. |
| `continuation` | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optional | Native conversation ID to continue; fork requests a separate conversation derived from it.                                                                                                                         |

## Signature

```ts
export interface AgentInput {
  readonly text?: string;
  readonly interactive?: boolean;
  /** Requests the liveInput protocol: stdin carries the encoded prompt and stays open. */
  readonly liveInput?: boolean;
  readonly continuation?: {
    readonly id: string;
    readonly fork?: boolean;
  };
}
```
