---
title: "CustomReporterOptions"
description: "CustomReporterOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CustomReporterOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                                                                                | Presence | Meaning                                                                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `capacity`          | `number \| undefined`                                                               | Optional | Maximum waiting events in the reporter queue, default 1024; overflow drops newest deliveries and makes flush reject.                                        |
| `deliveryTimeoutMs` | `number \| undefined`                                                               | Optional | Maximum asynchronous handler wait in milliseconds, default 5000; timeout disables further deliveries and makes flush reject.                                |
| `onError`           | `((error: unknown, event: AgentObservation) => void \| Promise<void>) \| undefined` | Optional | Called for each failed handler with its error and event; diagnostic failures are isolated and the first handler failure remains observable through flush(). |

## Signature

```ts
export interface CustomReporterOptions {
  readonly capacity?: number;
  readonly deliveryTimeoutMs?: number;
  readonly onError?: (
    error: unknown,
    event: AgentObservation,
  ) => void | Promise<void>;
}
```

## Related contracts

- [AgentObservation](../agentobservation/)
