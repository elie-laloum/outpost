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

| Name   | Type                                      | Presence | Meaning                                                                                                                                                                                                         |
| ------ | ----------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open` | `(input: AgentInput) => AgentLiveSession` | Required | Start the protocol state of one turn requested with the given input. Outpost opens a session when it runs the turn with liveInput and closes stdin after a final event once every written message was consumed. |

## Signature

```ts
export interface AgentLiveInput {
  /** Starts the protocol state of one turn requested with input. */
  open(input: AgentInput): AgentLiveSession;
}
```

## Related contracts

- [AgentInput](../agentinput/)
- [AgentLiveSession](../agentlivesession/)
