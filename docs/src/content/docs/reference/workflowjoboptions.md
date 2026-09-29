---
title: "WorkflowJobOptions"
description: "WorkflowJobOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowJobOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                                                                                  | Presence | Meaning                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workflow`   | `(input: WorkflowJson, context: WorkflowJobContext) => Workflow \| Promise<Workflow>` | Required | Build the workflow for one job input; the same input must build the same workflow, and it may be asynchronous.                                     |
| `checkpoint` | `WorkflowJobCheckpoint`                                                               | Required | Checkpoint store and version used for every job; required.                                                                                         |
| `start`      | `WorkflowJobStartOptions \| undefined`                                                | Optional | Other workflow start options, such as concurrency, budget, onQuota or timeoutMs; checkpoint, signal, decisions and answers are managed by the job. |

## Signature

```ts
export interface WorkflowJobOptions {
  /** Builds the workflow for one job input; the same input must build the same workflow. */
  workflow(
    input: WorkflowJson,
    context: WorkflowJobContext,
  ): Workflow | Promise<Workflow>;
  readonly checkpoint: WorkflowJobCheckpoint;
  readonly start?: WorkflowJobStartOptions;
}
```

## Related contracts

- [Workflow](../type-workflow/)
- [WorkflowJobCheckpoint](../workflowjobcheckpoint/)
- [WorkflowJobContext](../workflowjobcontext/)
- [WorkflowJobStartOptions](../workflowjobstartoptions/)
- [WorkflowJson](../workflowjson/)
