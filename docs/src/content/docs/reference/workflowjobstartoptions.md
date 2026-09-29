---
title: "WorkflowJobStartOptions"
description: "WorkflowJobStartOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkflowJobStartOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                               |
| ------------------ | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `observation`      | `ObservationHub \| undefined`                   | Optional | Parent hub receiving workflow, task, agent and operation envelopes; historical observe callbacks still receive WorkflowEvent.                                                                                                                                                         |
| `timeoutMs`        | `number \| undefined`                           | Optional | Deadline in milliseconds for this start() call, a positive integer up to 2147483647, covering checkpoint acquisition, conditions, attempts and retry waits. Expiry cancels running tasks and the status is failed with an OutpostError code timeout; each call gets a fresh deadline. |
| `onQuota`          | `WorkflowQuotaPolicy \| undefined`              | Optional | Opt-in policy that pauses a task on a quota error instead of retrying or failing it; requires a checkpoint. Quota pauses release on a later start() once the reset is known to be reachable within maxWaitMs, or when it is unknown or past.                                          |
| `decisionVerifier` | `WorkflowDecisionVerifier \| undefined`         | Optional | Trusted verifier invoked for each submitted proof; required to accept decisions on signed gates. Verification failures leave all pending decisions unapplied.                                                                                                                         |
| `concurrency`      | `number \| undefined`                           | Optional | Maximum tasks running at once, default 1 (tasks run in list order). Must be a positive integer.                                                                                                                                                                                       |
| `budget`           | `WorkflowBudget \| undefined`                   | Optional | Attempt and token limits shared by every task, including restored usage; reaching one fails the run with WorkflowBudgetExceeded.                                                                                                                                                      |
| `stopOnError`      | `boolean \| undefined`                          | Optional | Defaults to true: the first failure aborts the run, cancelling running and pending tasks. With false, only dependents of the failed task are skipped and independent tasks continue.                                                                                                  |
| `telemetry`        | `WorkflowTelemetry \| undefined`                | Optional | Adapter that receives each WorkflowEvent before observe, such as createOpenTelemetryObserver({ tracer, meter }). Its errors go to observerErrors; you own its lifecycle.                                                                                                              |
| `observe`          | `((event: WorkflowEvent) => void) \| undefined` | Optional | Receives each WorkflowEvent after telemetry; thrown errors are collected in observerErrors without changing the run.                                                                                                                                                                  |

## Signature

```ts
export type WorkflowJobStartOptions = Omit<
  WorkflowOptions,
  "checkpoint" | "signal" | "decisions" | "answers"
>;
```

## Related contracts

- [WorkflowOptions](../workflowoptions/)
