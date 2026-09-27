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

| Name            | Type                             | Presence | Meaning                                                                                                                                                                          |
| --------------- | -------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sink`          | `ObservationSink`                | Required | Unified hub receiver producing parented workflow, task, dispatch and operation spans and existing metrics; use instead of wiring the same instance through legacy telemetry too. |
| `close`         | `() => void`                     | Required | Finish any outstanding execution spans owned by this observer.                                                                                                                   |
| `startDispatch` | `() => DispatchTelemetrySession` | Required | Start an independent session for one public dispatch invocation; called before validation.                                                                                       |
| `observe`       | `(event: WorkflowEvent) => void` | Required | Convert a workflow event into telemetry spans and metrics.                                                                                                                       |

## Signature

```ts
export interface OpenTelemetryObserver
  extends DispatchTelemetry, WorkflowTelemetry {
  readonly sink: ObservationSink;
  close(): void;
}
```

## Related contracts

- [DispatchTelemetry](../dispatchtelemetry/)
- [WorkflowTelemetry](../workflowtelemetry/)
