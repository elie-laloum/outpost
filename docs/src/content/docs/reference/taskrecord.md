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
| `cacheHit`      | `true \| undefined`                       | Optional | true when the task value was restored from its task cache in this execution; the task then has zero attempts.                                    |
| `quota`         | `WorkflowQuotaPause \| undefined`         | Optional | Persisted quota pause of a paused task: when it was recorded, the quota message and the reset time when known. Removed when the task runs again. |
| `interaction`   | `TaskInteractionRecord \| undefined`      | Optional | Persisted continuation state, latest question and accepted answer for an interactive task.                                                       |
| `rounds`        | `readonly LoopRoundRecord[] \| undefined` | Optional | Ordered progress of a loop task, including completed rounds and the current phase; absent for ordinary tasks.                                    |
| `usageReceipts` | `readonly string[] \| undefined`          | Optional | Persisted receipt IDs that prevent repeated accounting of the same usage report.                                                                 |
| `pause`         | `WorkflowPauseRequest \| undefined`       | Optional | Persisted pending gate request, including its unique ID and authorized actors.                                                                   |
| `decision`      | `WorkflowDecisionRecord \| undefined`     | Optional | Validated decision recorded for the task’s gate.                                                                                                 |
| `key`           | `string`                                  | Required | Stable task key identifying the node within its workflow graph.                                                                                  |
| `status`        | `TaskStatus`                              | Required | Task state: waiting, active, done, failed, skipped, cancelled, paused (gate or quota), rejected or waiting-input.                                |
| `attempts`      | `number`                                  | Required | Attempts started, cumulative across retries and checkpoint resumes; 0 for a skipped task or a cache hit.                                         |
| `startedAt`     | `string \| undefined`                     | Optional | ISO timestamp of the task's latest start.                                                                                                        |
| `finishedAt`    | `string \| undefined`                     | Optional | ISO timestamp when the task reached its current status, including paused and waiting-input.                                                      |
| `error`         | `string \| undefined`                     | Optional | Message of the error that failed or cancelled the task, or of its gate rejection.                                                                |

## Signature

```ts
export interface TaskRecord {
  cacheHit?: true;
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
