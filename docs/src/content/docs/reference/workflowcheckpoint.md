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

| Name          | Type                                                | Presence | Meaning                                                                                                                                                                                           |
| ------------- | --------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`      | `1`                                                 | Required | Serialization format version, always 1.                                                                                                                                                           |
| `identity`    | `string`                                            | Required | SHA-256 of the workflow name, checkpoint version and task graph: keys, dependencies, timeout, retry, condition, gate, loop and interaction settings. A different identity rejects the checkpoint. |
| `executionId` | `string`                                            | Required | Execution identity kept across resumes. context.idempotencyKey derives from it and the task key, so it stays the same for each task.                                                              |
| `records`     | `readonly Readonly<TaskRecord>[]`                   | Required | One record per task: status, attempts, timestamps, error, usage receipts and any gate, input, quota, loop or cache state.                                                                         |
| `values`      | `Readonly<Record<string, WorkflowCheckpointValue>>` | Required | Output of each done task, keyed by task key. Restored on resume, so done tasks never run again.                                                                                                   |
| `usage`       | `WorkflowUsage`                                     | Required | Attempts and token usage summed across every resume; its attempts must equal the sum of the records' attempts. A resumed run's budget continues from these totals.                                |

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
