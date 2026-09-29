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

| Name               | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                                                             |
| ------------------ | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onQuota`          | `WorkflowQuotaPolicy \| undefined`              | Optional | Opt-in policy that pauses a task on a quota error instead of retrying or failing it; requires a checkpoint. Quota pauses release on a later start() once the reset is known to be reachable within maxWaitMs, or when it is unknown or past.                                                                        |
| `answers`          | `readonly WorkflowAnswer[] \| undefined`        | Optional | Responses to pending input requests; all answers are validated before any are applied and persisted before scheduling.                                                                                                                                                                                              |
| `timeoutMs`        | `number \| undefined`                           | Optional | Positive integer deadline in milliseconds for this start() call, up to 2147483647. Includes checkpoint acquisition, conditions, attempts and retry waits. Expiration cooperatively cancels tasks and fails the workflow with an OutpostError timeout; cleanup is awaited. A resumed call receives a fresh deadline. |
| `observation`      | `ObservationHub \| undefined`                   | Optional | Parent hub receiving workflow, task, agent and operation envelopes; historical observe callbacks still receive WorkflowEvent.                                                                                                                                                                                       |
| `decisionVerifier` | `WorkflowDecisionVerifier \| undefined`         | Optional | Trusted verifier invoked for each submitted proof; required to accept decisions on signed gates. Verification failures leave all pending decisions unapplied.                                                                                                                                                       |
| `decisions`        | `readonly WorkflowDecision[] \| undefined`      | Optional | Explicit decisions for persisted pending gates.                                                                                                                                                                                                                                                                     |
| `checkpoint`       | `WorkflowCheckpointOptions \| undefined`        | Optional | Durable execution storage and replay configuration.                                                                                                                                                                                                                                                                 |
| `signal`           | `AbortSignal \| undefined`                      | Optional | Cooperative cancellation for this operation.                                                                                                                                                                                                                                                                        |
| `concurrency`      | `number \| undefined`                           | Optional | Maximum number of workflow tasks running concurrently.                                                                                                                                                                                                                                                              |
| `budget`           | `WorkflowBudget \| undefined`                   | Optional | Shared attempt and observed usage admission limits.                                                                                                                                                                                                                                                                 |
| `stopOnError`      | `boolean \| undefined`                          | Optional | Defaults to true: the first failure aborts the run, cancelling running and pending tasks. With false, only dependents of the failed task are skipped and independent tasks continue.                                                                                                                                |
| `telemetry`        | `WorkflowTelemetry \| undefined`                | Optional | Workflow telemetry adapter, such as createOpenTelemetryObserver({ tracer, meter }); receives events before observe, with isolated exceptions collected in observerErrors. Caller owns its lifecycle; dispatch instrumentation is configured separately.                                                             |
| `observe`          | `((event: WorkflowEvent) => void) \| undefined` | Optional | Custom workflow lifecycle and usage callback, invoked after telemetry independently; thrown errors are collected in observerErrors. Existing OpenTelemetry observe callbacks remain supported.                                                                                                                      |

## Signature

```ts
export interface WorkflowOptions {
  readonly onQuota?: WorkflowQuotaPolicy;
  readonly answers?: readonly WorkflowAnswer[];
  readonly timeoutMs?: number;
  readonly observation?: ObservationHub;
  readonly decisionVerifier?: WorkflowDecisionVerifier;
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
- [WorkflowAnswer](../workflowanswer/)
- [WorkflowBudget](../workflowbudget/)
- [WorkflowCheckpointOptions](../workflowcheckpointoptions/)
- [WorkflowDecision](../workflowdecision/)
- [WorkflowDecisionVerifier](../workflowdecisionverifier/)
- [WorkflowEvent](../workflowevent/)
- [WorkflowQuotaPolicy](../workflowquotapolicy/)
- [WorkflowTelemetry](../workflowtelemetry/)
