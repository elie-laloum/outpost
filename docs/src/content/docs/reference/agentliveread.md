---
title: "AgentLiveRead"
description: "AgentLiveRead — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentLiveRead } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                | Presence | Meaning                                                                                                   |
| ---------- | ------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `consumed` | `number`            | Required | Number of written user messages, including the prompt, that this output line confirms the agent accepted. |
| `replies`  | `readonly string[]` | Required | Complete stdin messages to write in response to this output line, in order.                               |

## Signature

```ts
export interface AgentLiveRead {
  readonly consumed: number;
  readonly replies: readonly string[];
}
```
