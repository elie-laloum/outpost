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

| Name            | Type                             | Presence | Meaning                                                                                    |
| --------------- | -------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `observe`       | `(event: WorkflowEvent) => void` | Required | Convert a workflow event into telemetry spans and metrics.                                 |
| `close`         | `() => void`                     | Required | Finish any outstanding execution spans owned by this observer.                             |
| `startDispatch` | `() => DispatchTelemetrySession` | Required | Start an independent session for one public dispatch invocation; called before validation. |

## Signature

```ts
export interface OpenTelemetryObserver extends DispatchTelemetry {
  observe(event: WorkflowEvent): void;
  close(): void;
}
```

## Related contracts

- [DispatchTelemetry](../dispatchtelemetry/)
- [WorkflowEvent](../workflowevent/)
