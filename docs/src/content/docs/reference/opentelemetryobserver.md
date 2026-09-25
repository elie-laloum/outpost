---
title: "OpenTelemetryObserver"
description: "OpenTelemetryObserver — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { OpenTelemetryObserver } from "@elie-laloum/outpost/opentelemetry";
```

## Parameters and properties

| Name      | Type                             | Presence | Meaning                                                        |
| --------- | -------------------------------- | -------- | -------------------------------------------------------------- |
| `observe` | `(event: WorkflowEvent) => void` | Required | Convert a workflow event into telemetry spans and metrics.     |
| `close`   | `() => void`                     | Required | Finish any outstanding execution spans owned by this observer. |

## Signature

```ts
export interface OpenTelemetryObserver {
  observe(event: WorkflowEvent): void;
  close(): void;
}
```

## Related contracts

- [WorkflowEvent](../workflowevent/)
