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

| Name          | Type                                            | Presence | Meaning                                                                                            |
| ------------- | ----------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `decisions`   | `readonly WorkflowDecision[] \| undefined`      | Optional | Explicit decisions for persisted pending gates.                                                    |
| `checkpoint`  | `WorkflowCheckpointOptions \| undefined`        | Optional | Durable execution storage and replay configuration.                                                |
| `signal`      | `AbortSignal \| undefined`                      | Optional | Cooperative cancellation for this operation.                                                       |
| `concurrency` | `number \| undefined`                           | Optional | Maximum number of workflow tasks running concurrently.                                             |
| `budget`      | `WorkflowBudget \| undefined`                   | Optional | Shared attempt and observed usage admission limits.                                                |
| `stopOnError` | `boolean \| undefined`                          | Optional | Stop admitting new tasks after a task failure when enabled.                                        |
| `observe`     | `((event: WorkflowEvent) => void) \| undefined` | Optional | Receive workflow state and usage events; thrown errors are collected separately in observerErrors. |

## Signature

```ts
export interface WorkflowOptions {
  readonly decisions?: readonly WorkflowDecision[];
  readonly checkpoint?: WorkflowCheckpointOptions;
  readonly signal?: AbortSignal;
  readonly concurrency?: number;
  readonly budget?: WorkflowBudget;
  readonly stopOnError?: boolean;
  readonly observe?: (event: WorkflowEvent) => void;
}
```

## Related contracts

- [WorkflowBudget](../workflowbudget/)
- [WorkflowCheckpointOptions](../workflowcheckpointoptions/)
- [WorkflowDecision](../workflowdecision/)
- [WorkflowEvent](../workflowevent/)
