---
title: "ModelRouteEvent"
description: "ModelRouteEvent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ModelRouteEvent } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                                          | Presence | Meaning                                                                                                             |
| ------------ | --------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `kind`       | `"model-route"`                               | Required | Selection event discriminator model-route.                                                                          |
| `step`       | `number`                                      | Required | Harness step for which this effective model was selected.                                                           |
| `choice`     | `string`                                      | Required | Effective candidate key after confidence and availability fallback rules.                                           |
| `model`      | `AgentModel`                                  | Required | Selected normalized model with its own reasoning and output settings.                                               |
| `reason`     | `"unavailable" \| "selected" \| "confidence"` | Required | Selected for accepted confidence, confidence for low-confidence fallback, unavailable for a permitted router fault. |
| `confidence` | `number \| undefined`                         | Optional | Native decision confidence, present only when a valid choice response was received.                                 |

## Signature

```ts
export interface ModelRouteEvent {
  readonly kind: "model-route";
  readonly step: number;
  readonly choice: string;
  readonly model: AgentModel;
  readonly reason: "selected" | "confidence" | "unavailable";
  readonly confidence?: number;
}
```

## Related contracts

- [AgentModel](../agentmodel/)
