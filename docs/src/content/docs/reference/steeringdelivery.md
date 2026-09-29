---
title: "SteeringDelivery"
description: "SteeringDelivery — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SteeringDelivery } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name   | Type           | Presence | Meaning                                                                                                                                     |
| ------ | -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode` | `SteeringMode` | Required | injected when the instruction joined the running turn or its prompt; resumed when Outpost continued the conversation in a new turn with it. |

## Signature

```ts
export interface SteeringDelivery {
  /** `injected` joined the running turn; `resumed` continued the conversation in a new turn. */
  readonly mode: SteeringMode;
}
```

## Related contracts

- [SteeringMode](../steeringmode/)
