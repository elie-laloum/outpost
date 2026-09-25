---
title: "WorkflowCheckpoint"
description: "WorkflowCheckpoint — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowCheckpoint**. See the [workflow checkpoints guide](../../guide/advanced/checkpoints/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowCheckpoint } from "@elie-laloum/outpost";
```

## Purpose and behavior

Persist lossless task results and explicitly reopen the same graph across process restarts.

Completed outputs are not replayed. Interrupted ordinary tasks require retry-incomplete authorization. Outputs must be lossless JSON; full dispatch results contain functions and cannot be checkpointed directly.

[Complete example and detailed rules](../../guide/advanced/checkpoints/).

## Parameters and properties

| Name          | Type                                                | Presence | Meaning                                                                 |
| ------------- | --------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `format`      | `1`                                                 | Required | See the linked contract and this family's rules for its interpretation. |
| `identity`    | `string`                                            | Required | See the linked contract and this family's rules for its interpretation. |
| `executionId` | `string`                                            | Required | See the linked contract and this family's rules for its interpretation. |
| `records`     | `readonly Readonly<TaskRecord>[]`                   | Required | See the linked contract and this family's rules for its interpretation. |
| `values`      | `Readonly<Record<string, WorkflowCheckpointValue>>` | Required | See the linked contract and this family's rules for its interpretation. |
| `usage`       | `WorkflowUsage`                                     | Required | Reported usage counters; not a currency estimate.                       |

## Signature

```ts
export interface WorkflowCheckpoint {
  readonly format: 1;
  readonly identity: string;
  readonly executionId: string;
  readonly records: readonly Readonly<TaskRecord>[];
  readonly values: Readonly<Record<string, WorkflowCheckpointValue>>;
  readonly usage: WorkflowUsage;
}
```

## Related contracts

- [TaskRecord](../taskrecord/)
- [WorkflowCheckpointValue](../workflowcheckpointvalue/)
- [WorkflowUsage](../workflowusage/)
