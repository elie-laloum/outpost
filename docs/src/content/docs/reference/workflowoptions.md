---
title: "WorkflowOptions"
description: "WorkflowOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                                                             |
| ------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `timeoutMs`   | `number \| undefined`                           | Optional | Positive integer deadline in milliseconds for this start() call, up to 2147483647. Includes checkpoint acquisition, conditions, attempts and retry waits. Expiration cooperatively cancels tasks and fails the workflow with an OutpostError timeout; cleanup is awaited. A resumed call receives a fresh deadline. |
| `observation` | `ObservationHub \| undefined`                   | Optional | Parent hub receiving workflow, task, agent and operation envelopes; historical observe callbacks still receive WorkflowEvent.                                                                                                                                                                                       |
| `decisions`   | `readonly WorkflowDecision[] \| undefined`      | Optional | Explicit decisions for persisted pending gates.                                                                                                                                                                                                                                                                     |
| `checkpoint`  | `WorkflowCheckpointOptions \| undefined`        | Optional | Durable execution storage and replay configuration.                                                                                                                                                                                                                                                                 |
| `signal`      | `AbortSignal \| undefined`                      | Optional | Cooperative cancellation for this operation.                                                                                                                                                                                                                                                                        |
| `concurrency` | `number \| undefined`                           | Optional | Maximum number of workflow tasks running concurrently.                                                                                                                                                                                                                                                              |
| `budget`      | `WorkflowBudget \| undefined`                   | Optional | Shared attempt and observed usage admission limits.                                                                                                                                                                                                                                                                 |
| `stopOnError` | `boolean \| undefined`                          | Optional | Stop admitting new tasks after a task failure when enabled.                                                                                                                                                                                                                                                         |
| `telemetry`   | `WorkflowTelemetry \| undefined`                | Optional | Workflow telemetry adapter, such as openTelemetry({ tracer, meter }); receives events before observe, with isolated exceptions collected in observerErrors. Caller owns its lifecycle; dispatch instrumentation is configured separately.                                                                           |
| `observe`     | `((event: WorkflowEvent) => void) \| undefined` | Optional | Custom workflow lifecycle and usage callback, invoked after telemetry independently; thrown errors are collected in observerErrors. Existing OpenTelemetry observe callbacks remain supported.                                                                                                                      |

## Signature

```ts
export interface WorkflowOptions {
  readonly timeoutMs?: number;
  readonly observation?: ObservationHub;
  readonly decisions?: readonly WorkflowDecision[];
  readonly checkpoint?: WorkflowCheckpointOptions;
  readonly signal?: AbortSignal;
  readonly concurrency?: number;
  readonly budget?: WorkflowBudget;
  readonly stopOnError?: boolean;
  readonly telemetry?: WorkflowTelemetry;
  readonly observe?: (event: WorkflowEvent) => void;
}
```

## Related contracts

- [ObservationHub](../observationhub/)
- [WorkflowBudget](../workflowbudget/)
- [WorkflowCheckpointOptions](../workflowcheckpointoptions/)
- [WorkflowDecision](../workflowdecision/)
- [WorkflowEvent](../workflowevent/)
- [WorkflowTelemetry](../workflowtelemetry/)
