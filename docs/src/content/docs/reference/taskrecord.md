---
title: "TaskRecord"
description: "TaskRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskRecord } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                                  | Presence | Meaning                                                                                               |
| --------------- | ------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `usageReceipts` | `readonly string[] \| undefined`      | Optional | Persisted receipt IDs that prevent repeated accounting of the same usage report.                      |
| `pause`         | `WorkflowPauseRequest \| undefined`   | Optional | Persisted pending gate request, including its unique ID and authorized actors.                        |
| `decision`      | `WorkflowDecisionRecord \| undefined` | Optional | Validated decision recorded for the task’s gate.                                                      |
| `key`           | `string`                              | Required | Stable task key identifying the node within its workflow graph.                                       |
| `status`        | `TaskStatus`                          | Required | Task lifecycle state, including waiting, active, done, failure, cancellation or gate pause/rejection. |
| `attempts`      | `number`                              | Required | Number of attempts actually started for this task.                                                    |
| `startedAt`     | `string \| undefined`                 | Optional | ISO timestamp when execution of this task or operation started.                                       |
| `finishedAt`    | `string \| undefined`                 | Optional | ISO timestamp when execution of this task or operation finished.                                      |
| `error`         | `string \| undefined`                 | Optional | Recorded failure message for the task, when present.                                                  |

## Signature

```ts
export interface TaskRecord {
  usageReceipts?: readonly string[];
  pause?: WorkflowPauseRequest;
  decision?: WorkflowDecisionRecord;
  readonly key: string;
  status: TaskStatus;
  attempts: number;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
}
```

## Related contracts

- [TaskStatus](../taskstatus/)
- [WorkflowDecisionRecord](../workflowdecisionrecord/)
- [WorkflowPauseRequest](../workflowpauserequest/)
