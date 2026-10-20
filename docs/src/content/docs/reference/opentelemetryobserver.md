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

| Name            | Type                                            | Presence | Meaning                                                                                                                                                                                                                                           |
| --------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `observe`       | `(event: Observation \| WorkflowEvent) => void` | Required | Accept an Observation envelope as an ObservationSink, or a historical WorkflowEvent callback. Envelopes route workflow, dispatch and operation activity to spans and metrics. Wire only one delivery path per execution to avoid double counting. |
| `sink`          | `ObservationSink`                               | Required | Hub sink that turns observations into parented workflow, task, attempt, dispatch and operation spans plus the same metrics. Do not also pass this observer as telemetry to the same run: spans and metrics would be duplicated.                   |
| `close`         | `() => void`                                    | Required | Ends every open workflow, task, attempt, dispatch and operation span as cancelled or failed. It does not flush or shut down the SDK.                                                                                                              |
| `startDispatch` | `() => DispatchTelemetrySession`                | Required | Start an independent session for one public dispatch invocation; called before validation.                                                                                                                                                        |

## Signature

```ts
export interface OpenTelemetryObserver
  extends DispatchTelemetry, WorkflowTelemetry {
  observe(event: Observation | WorkflowEvent): void;
  readonly sink: ObservationSink;
  close(): void;
}
```

## Related contracts

- [DispatchTelemetry](../dispatchtelemetry/)
- [WorkflowTelemetry](../workflowtelemetry/)
