---
title: "CustomReporter"
description: "CustomReporter — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CustomReporter } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type                  | Presence | Meaning                                                                                                                                              |
| ------- | --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `event` | `AgentObservation`    | Required | Normalized agent observation to enqueue; returns immediately without waiting for its handler.                                                        |
| `flush` | `() => Promise<void>` | Required | Wait for events received before this call; reject with the first handler failure, including on subsequent calls, without closing external resources. |

## Signature

```ts
export interface CustomReporter {
  (event: AgentObservation): void;
  flush(): Promise<void>;
}
```

## Related contracts

- [AgentObservation](../agentobservation/)
