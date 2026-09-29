---
title: "defineWorkflowJob"
description: "defineWorkflowJob — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineWorkflowJob } from "@elie-laloum/outpost";
```

## Purpose and behavior

Return a queue handler that builds a workflow from each trigger job input and starts it with the job runId as checkpoint run, the job signal and a version combining checkpoint.version with an input digest. The job value summarizes the run, including that version and pending gates; failed or cancelled workflows complete the job with an error.

[Complete example and detailed rules](../../guide/job-queues/).

## Parameters and properties

| Name                 | Type                                                                                  | Presence | Meaning                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`            | `WorkflowJobOptions`                                                                  | Required | Workflow factory, checkpoint settings and start options.                                                                                           |
| `options.workflow`   | `(input: WorkflowJson, context: WorkflowJobContext) => Workflow \| Promise<Workflow>` | Required | Build the workflow for one job input; the same input must build the same workflow, and it may be asynchronous.                                     |
| `options.checkpoint` | `WorkflowJobCheckpoint`                                                               | Required | Checkpoint store and version used for every job; required.                                                                                         |
| `options.start`      | `WorkflowJobStartOptions \| undefined`                                                | Optional | Other workflow start options, such as concurrency, budget, onQuota or timeoutMs; checkpoint, signal, decisions and answers are managed by the job. |

## Returns

`QueueHandler`

## Signature

```ts
export declare function defineWorkflowJob(
  options: WorkflowJobOptions,
): QueueHandler;
```

## Related contracts

- [QueueHandler](../queuehandler/)
- [WorkflowJobOptions](../workflowjoboptions/)
