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

| Name            | Type                             | Presence | Meaning                                                                                                                                                                                                                         |
| --------------- | -------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sink`          | `ObservationSink`                | Required | Hub sink that turns observations into parented workflow, task, attempt, dispatch and operation spans plus the same metrics. Do not also pass this observer as telemetry to the same run: spans and metrics would be duplicated. |
| `close`         | `() => void`                     | Required | Ends every open workflow, task, attempt, dispatch and operation span as cancelled or failed. It does not flush or shut down the SDK.                                                                                            |
| `startDispatch` | `() => DispatchTelemetrySession` | Required | Start an independent session for one public dispatch invocation; called before validation.                                                                                                                                      |
| `observe`       | `(event: WorkflowEvent) => void` | Required | Records a workflow event as spans and metrics; workflow.start() calls it when the observer is passed as telemetry.                                                                                                              |

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
