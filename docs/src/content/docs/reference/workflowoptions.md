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

| Name               | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                               |
| ------------------ | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `redact`           | `readonly RegExp[] \| undefined`                | Optional | Rules applied before every workflow or nested dispatch sink and to supported captured conversations. Inherited by child observation scopes.                                                                                                                                           |
| `onQuota`          | `WorkflowQuotaPolicy \| undefined`              | Optional | Opt-in policy that pauses a task on a quota error instead of retrying or failing it; requires a checkpoint. Quota pauses release on a later start() once the reset is known to be reachable within maxWaitMs, or when it is unknown or past.                                          |
| `answers`          | `readonly WorkflowAnswer[] \| undefined`        | Optional | Answers to pending input requests, not empty; requires a checkpoint. All are validated before any is applied, and an invalid, stale or duplicate answer makes start() reject.                                                                                                         |
| `timeoutMs`        | `number \| undefined`                           | Optional | Deadline in milliseconds for this start() call, a positive integer up to 2147483647, covering checkpoint acquisition, conditions, attempts and retry waits. Expiry cancels running tasks and the status is failed with an OutpostError code timeout; each call gets a fresh deadline. |
| `observation`      | `ObservationHub \| undefined`                   | Optional | Parent hub receiving workflow, task, agent and operation envelopes; historical observe callbacks still receive WorkflowEvent.                                                                                                                                                         |
| `decisionVerifier` | `WorkflowDecisionVerifier \| undefined`         | Optional | Trusted verifier invoked for each submitted proof; required to accept decisions on signed gates. Verification failures leave all pending decisions unapplied.                                                                                                                         |
| `decisions`        | `readonly WorkflowDecision[] \| undefined`      | Optional | Explicit decisions for persisted pending gates.                                                                                                                                                                                                                                       |
| `checkpoint`       | `WorkflowCheckpointOptions \| undefined`        | Optional | Store, runId and version that persist task states, outputs and usage between start() calls. Required for gates, interactions, answers, decisions and onQuota.                                                                                                                         |
| `signal`           | `AbortSignal \| undefined`                      | Optional | Cancels the run: running tasks see context.signal abort, pending tasks end cancelled and the status is cancelled.                                                                                                                                                                     |
| `concurrency`      | `number \| undefined`                           | Optional | Maximum tasks running at once, default 1 (tasks run in list order). Must be a positive integer.                                                                                                                                                                                       |
| `budget`           | `WorkflowBudget \| undefined`                   | Optional | Attempt and token limits shared by every task, including restored usage; reaching one fails the run with WorkflowBudgetExceeded.                                                                                                                                                      |
| `stopOnError`      | `boolean \| undefined`                          | Optional | Defaults to true: the first failure aborts the run, cancelling running and pending tasks. With false, only dependents of the failed task are skipped and independent tasks continue.                                                                                                  |
| `telemetry`        | `WorkflowTelemetry \| undefined`                | Optional | Adapter that receives each WorkflowEvent before observe, such as createOpenTelemetryObserver({ tracer, meter }). Its errors go to observerErrors; you own its lifecycle.                                                                                                              |
| `observe`          | `((event: WorkflowEvent) => void) \| undefined` | Optional | Receives each WorkflowEvent after telemetry; thrown errors are collected in observerErrors without changing the run.                                                                                                                                                                  |

## Signature

```ts
export interface WorkflowOptions {
  readonly redact?: readonly RegExp[];
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
