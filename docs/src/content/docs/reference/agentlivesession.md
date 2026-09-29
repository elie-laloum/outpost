---
title: "AgentLiveSession"
description: "AgentLiveSession — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentLiveSession } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type                              | Presence | Meaning                                                                                                                                                                             |
| -------- | --------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `encode` | `(text: string) => string`        | Required | Encode one user message for stdin, including its line terminator, or return an empty string when the session sends it itself once the agent can accept input.                       |
| `read`   | `(line: string) => AgentLiveRead` | Required | Read one output line and return the user messages it confirms consumed and the protocol replies Outpost writes to stdin, such as handshake requests or refusals of server requests. |

## Signature

```ts
export interface AgentLiveSession {
  /** Encodes one user message for stdin, or returns "" when the session sends it later. */
  encode(text: string): string;
  /** Reads one output line: user messages it confirms and protocol replies to write. */
  read(line: string): AgentLiveRead;
}
```

## Related contracts

- [AgentLiveRead](../agentliveread/)
