---
title: "ReplayDecisionEvent"
description: "ReplayDecisionEvent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReplayDecisionEvent } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                                                                                                                                                        | Presence | Meaning                                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `before`     | `number`                                                                                                                                                    | Required | Zero-based position in ReplayTurn.events before which this decision observation is emitted; the event count denotes the trailing position. |
| `event`      | `DecisionEvent \| { readonly kind: "decision-request"; readonly request: unknown; } \| { readonly kind: "decision-response"; readonly response: unknown; }` | Required | Recorded lifecycle summary or verbose decision payload. Detailed request/response events are emitted only to a verbose observation hub.    |
| `subagentId` | `string \| undefined`                                                                                                                                       | Optional | Recorded child harness identity restored into the replay observation scope, when the decision originated from a subagent.                  |

## Signature

```ts
export interface ReplayDecisionEvent {
  readonly before: number;
  readonly event: Extract<
    ObservationEvent,
    {
      readonly kind: "decision" | "decision-request" | "decision-response";
    }
  >;
  readonly subagentId?: string;
}
```

## Related contracts

- [ObservationEvent](../observationevent/)
