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

| Name    | Type                                          | Presence | Meaning                                                                                                                                                                                                                             |
| ------- | --------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state` | `SteeringState`                               | Required | idle when no dispatch uses the controller, active while one does, closed after close().                                                                                                                                             |
| `send`  | `(text: string) => Promise<SteeringDelivery>` | Required | Queue a nonempty instruction for the attached dispatch, or the next one when none runs. Resolves with its delivery once the agent receives it; rejects with code steering when the dispatch ends first or the controller is closed. |
| `close` | `() => void`                                  | Required | Close the controller: reject undelivered instructions and every later send(); later dispatches reject it.                                                                                                                           |

## Signature

```ts
export interface Steering {
  /** `active` while a dispatch uses the controller, `closed` after close(). */
  readonly state: SteeringState;
  /** Resolves when the agent receives the text; rejects when no dispatch can deliver it. */
  send(text: string): Promise<SteeringDelivery>;
  /** Rejects undelivered messages and every later send. */
  close(): void;
}
```

## Related contracts

- [SteeringDelivery](../steeringdelivery/)
- [SteeringState](../steeringstate/)
