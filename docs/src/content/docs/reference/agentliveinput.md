---
title: "AgentLiveInput"
description: "AgentLiveInput — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentLiveInput } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                        | Presence | Meaning                                                                                                                                                               |
| ---------- | --------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `encode`   | `(text: string) => string`  | Required | Encode one user message for stdin, including its line terminator; also used for the initial prompt.                                                                   |
| `consumed` | `(line: string) => boolean` | Required | Return true for an output line confirming that the agent consumed one user message. Outpost closes stdin after a final event once every written message was consumed. |

## Signature

```ts
export interface AgentLiveInput {
  /** Encodes one user message, including its line terminator. */
  encode(text: string): string;
  /** Recognizes an output line confirming the agent consumed one user message. */
  consumed(line: string): boolean;
}
```
