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

| Name      | Type                                                                                | Presence | Meaning                                                                                                                                                     |
| --------- | ----------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onError` | `((error: unknown, event: AgentObservation) => void \| Promise<void>) \| undefined` | Optional | Called for each failed handler with its error and event; diagnostic failures are isolated and the first handler failure remains observable through flush(). |

## Signature

```ts
export interface CustomReporterOptions {
  readonly onError?: (
    error: unknown,
    event: AgentObservation,
  ) => void | Promise<void>;
}
```

## Related contracts

- [AgentObservation](../agentobservation/)
