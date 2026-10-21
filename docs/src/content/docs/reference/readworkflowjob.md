---
title: "readWorkflowJob"
description: "readWorkflowJob — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { readWorkflowJob } from "@elie-laloum/outpost/queues";
```

## Purpose and behavior

Project a workflow job record into its queue delivery status, run ID and, once a handler saved a result, the workflow status and next action. A done job can therefore report a paused or waiting-input workflow. Summaries saved before workflowStatus existed are read from their status field; a job without a saved summary returns only jobStatus and runId. Reading never authorizes replay or recovery.

[Complete example and detailed rules](../../guide/queued-workflows/).

## Parameters and properties

| Name  | Type       | Presence | Meaning                                                                                                                          |
| ----- | ---------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `job` | `QueueJob` | Required | Queue record of a job handled by defineWorkflowJob(), such as the result of queue.get(); its input must carry the trigger runId. |

## Returns

`WorkflowJobState`

## Signature

```ts
export declare function readWorkflowJob(job: QueueJob): WorkflowJobState;
```

## Related contracts

- [QueueJob](../queuejob/)
- [WorkflowJobState](../workflowjobstate/)
