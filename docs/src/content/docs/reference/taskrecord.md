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

| Name            | Type                                      | Presence | Meaning                                                                                                                                          |
| --------------- | ----------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `quota`         | `WorkflowQuotaPause \| undefined`         | Optional | Persisted quota pause of a paused task: when it was recorded, the quota message and the reset time when known. Removed when the task runs again. |
| `interaction`   | `TaskInteractionRecord \| undefined`      | Optional | Persisted continuation state, latest question and accepted answer for an interactive task.                                                       |
| `rounds`        | `readonly LoopRoundRecord[] \| undefined` | Optional | Ordered progress of a loop task, including completed rounds and the current phase; absent for ordinary tasks.                                    |
| `usageReceipts` | `readonly string[] \| undefined`          | Optional | Persisted receipt IDs that prevent repeated accounting of the same usage report.                                                                 |
| `pause`         | `WorkflowPauseRequest \| undefined`       | Optional | Persisted pending gate request, including its unique ID and authorized actors.                                                                   |
| `decision`      | `WorkflowDecisionRecord \| undefined`     | Optional | Validated decision recorded for the task’s gate.                                                                                                 |
| `key`           | `string`                                  | Required | Stable task key identifying the node within its workflow graph.                                                                                  |
| `status`        | `TaskStatus`                              | Required | Task lifecycle state, including waiting, active, done, failure, cancellation, gate pause/rejection or a quota pause.                             |
| `attempts`      | `number`                                  | Required | Number of attempts actually started for this task.                                                                                               |
| `startedAt`     | `string \| undefined`                     | Optional | ISO timestamp when execution of this task or operation started.                                                                                  |
| `finishedAt`    | `string \| undefined`                     | Optional | ISO timestamp when execution of this task or operation finished.                                                                                 |
| `error`         | `string \| undefined`                     | Optional | Recorded failure message for the task, when present.                                                                                             |

## Signature

```ts
export interface TaskRecord {
  quota?: WorkflowQuotaPause;
  interaction?: TaskInteractionRecord;
  rounds?: readonly LoopRoundRecord[];
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

- [LoopRoundRecord](../looproundrecord/)
- [TaskInteractionRecord](../taskinteractionrecord/)
- [TaskStatus](../taskstatus/)
- [WorkflowDecisionRecord](../workflowdecisionrecord/)
- [WorkflowPauseRequest](../workflowpauserequest/)
- [WorkflowQuotaPause](../workflowquotapause/)
