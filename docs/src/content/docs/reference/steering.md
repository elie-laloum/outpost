---
title: "Steering"
description: "Steering — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Steering } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type                                                                         | Presence | Meaning                                                                                                                                                                                                                                                                               |
| ------- | ---------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state` | `SteeringState`                                                              | Required | idle before and between dispatches, active while one runs, closed after close().                                                                                                                                                                                                      |
| `send`  | `(text: string, options?: SteeringSendOptions) => Promise<SteeringDelivery>` | Required | Queue an instruction; with no dispatch running, it waits for the next one. Resolves with its delivery mode once the agent receives it. Rejects with code configuration for empty text, and with code steering when the dispatch or target run ends first or the controller is closed. |
| `close` | `() => void`                                                                 | Required | Close the controller: pending and later instructions reject with code steering, and a dispatch given this controller fails.                                                                                                                                                           |

## Signature

```ts
export interface Steering {
  /** `active` while a dispatch uses the controller, `closed` after close(). */
  readonly state: SteeringState;
  /** Resolves when the agent receives the text; rejects when no dispatch can deliver it. */
  send(text: string, options?: SteeringSendOptions): Promise<SteeringDelivery>;
  /** Rejects undelivered messages and every later send. */
  close(): void;
}
```

## Related contracts

- [SteeringDelivery](../steeringdelivery/)
- [SteeringSendOptions](../steeringsendoptions/)
- [SteeringState](../steeringstate/)
