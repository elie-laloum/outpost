---
title: "WorkflowJobState"
description: "WorkflowJobState — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowJobState } from "@elie-laloum/outpost/queues";
```

## Parameters and properties

| Name             | Type                                                                                          | Presence | Meaning                                                                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `jobStatus`      | `"failed" \| "done" \| "cancelled" \| "active" \| "pending"`                                  | Required | Queue delivery status. done means the handler saved a settled workflow result, which may still be paused or waiting for input.                       |
| `runId`          | `string`                                                                                      | Required | Checkpoint run ID carried by the job input; use it to answer, decide or inspect the run.                                                             |
| `workflowStatus` | `"failed" \| "done" \| "cancelled" \| "rejected" \| "waiting-input" \| "paused" \| undefined` | Optional | Saved workflow status; absent while the job is pending or active, or when the handler failed before saving a summary.                                |
| `nextAction`     | `WorkflowJobNextAction \| undefined`                                                          | Optional | Operator action for the saved workflow status: none, answer, inspect-pause or inspect. inspect never authorizes replay or checkpoint-owner recovery. |

## Signature

```ts
export interface WorkflowJobState {
  /** Queue delivery state; `done` means the handler saved a settled workflow result. */
  readonly jobStatus: QueueJob["status"];
  readonly runId: string;
  /** Absent until a handler saved the workflow result. */
  readonly workflowStatus?: WorkflowResult["status"];
  readonly nextAction?: WorkflowJobNextAction;
}
```

## Related contracts

- [QueueJob](../queuejob/)
- [WorkflowJobNextAction](../workflowjobnextaction/)
- [WorkflowResult](../workflowresult/)
