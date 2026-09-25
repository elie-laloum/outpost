---
title: "WorkflowOptions"
description: "WorkflowOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowOptions**. See the [workflows guide](../../guide/workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Compose tasks with explicit dependency edges and typed result access.

Duplicate keys, missing dependencies and cycles fail validation. Failed or skipped dependencies skip descendants. Retries can repeat external effects. Unwrap throws on a non-successful result.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name          | Type                                            | Presence | Meaning                                                                 |
| ------------- | ----------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `decisions`   | `readonly WorkflowDecision[] \| undefined`      | Optional | Explicit decisions for persisted pending gates.                         |
| `checkpoint`  | `WorkflowCheckpointOptions \| undefined`        | Optional | Durable execution storage and replay configuration.                     |
| `signal`      | `AbortSignal \| undefined`                      | Optional | Cooperative cancellation for this operation.                            |
| `concurrency` | `number \| undefined`                           | Optional | Maximum admitted concurrent tasks or candidates.                        |
| `budget`      | `WorkflowBudget \| undefined`                   | Optional | Shared attempt and observed usage admission limits.                     |
| `stopOnError` | `boolean \| undefined`                          | Optional | See the linked contract and this family's rules for its interpretation. |
| `observe`     | `((event: WorkflowEvent) => void) \| undefined` | Optional | Notification callback; observer failures are isolated.                  |

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
