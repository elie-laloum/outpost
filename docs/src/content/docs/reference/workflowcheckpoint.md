---
title: "WorkflowCheckpoint"
description: "WorkflowCheckpoint — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowCheckpoint } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                                | Presence | Meaning                                                                               |
| ------------- | --------------------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| `format`      | `1`                                                 | Required | Checkpoint serialization format version; currently 1.                                 |
| `identity`    | `string`                                            | Required | Fingerprint binding saved state to the workflow graph and caller-supplied version.    |
| `executionId` | `string`                                            | Required | Identity of the workflow execution, preserved across checkpoint resumption.           |
| `records`     | `readonly Readonly<TaskRecord>[]`                   | Required | Saved status, attempts, decisions and usage receipts for each task.                   |
| `values`      | `Readonly<Record<string, WorkflowCheckpointValue>>` | Required | Saved completed task outputs indexed by task key and encoded as JSON or undefined.    |
| `usage`       | `WorkflowUsage`                                     | Required | Cumulative admitted attempts and observed token usage, including restored accounting. |

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
