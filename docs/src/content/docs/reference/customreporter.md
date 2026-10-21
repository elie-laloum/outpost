---
title: "CustomReporter"
description: "CustomReporter — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CustomReporter } from "@elie-laloum/outpost/observation";
```

## Parameters and properties

| Name      | Type                                                  | Presence | Meaning                                                                                                                                              |
| --------- | ----------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `event`   | `AgentObservation`                                    | Required | Normalized agent observation to enqueue; returns immediately without waiting for its handler.                                                        |
| `flush`   | `() => Promise<void>`                                 | Required | Wait for events received before this call; reject with the first handler failure, including on subsequent calls, without closing external resources. |
| `observe` | `(observation: Observation) => void \| Promise<void>` | Required | Receive one envelope; returned promises are serialized per sink and rejection is isolated from execution.                                            |

## Signature

```ts
export interface CustomReporter extends ObservationSink {
  (event: AgentObservation): void;
  flush(): Promise<void>;
}
```

## Related contracts

- [AgentObservation](../agentobservation/)
- [ObservationSink](../observationsink/)
