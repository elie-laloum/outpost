---
title: "TaskInteractionRecord"
description: "TaskInteractionRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskInteractionRecord } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                | Presence | Meaning                                                                                                      |
| --------- | ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `state`   | `WorkflowJson \| undefined`         | Optional | Immutable lossless JSON continuation state saved by the task.                                                |
| `request` | `WorkflowInputRequest \| undefined` | Optional | Most recent persisted question, pending until its answer is accepted.                                        |
| `answer`  | `WorkflowAnswerRecord \| undefined` | Optional | Accepted response to request, persisted before the task is scheduled again; replaced at the next suspension. |

## Signature

```ts
export interface TaskInteractionRecord {
  readonly state?: WorkflowJson;
  readonly request?: WorkflowInputRequest;
  readonly answer?: WorkflowAnswerRecord;
}
```

## Related contracts

- [WorkflowAnswerRecord](../workflowanswerrecord/)
- [WorkflowInputRequest](../workflowinputrequest/)
- [WorkflowJson](../workflowjson/)
