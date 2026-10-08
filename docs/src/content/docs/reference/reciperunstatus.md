---
title: "RecipeRunStatus"
description: "RecipeRunStatus — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeRunStatus } from "@elie-laloum/outpost/recipes";
```

## Parameters and properties

| Name          | Type                                                  | Presence | Meaning                                                                                                     |
| ------------- | ----------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `runId`       | `string`                                              | Required | Requested durable checkpoint identifier.                                                                    |
| `revision`    | `string`                                              | Required | Exact storage revision used to fence an explicit checkpoint recovery.                                       |
| `owned`       | `boolean`                                             | Required | Whether the checkpoint records an owner; this does not prove that the owner is alive or authorize recovery. |
| `executionId` | `string \| undefined`                                 | Optional | Native workflow execution ID retained across resumes, when initialized.                                     |
| `report`      | `RecipeReport \| undefined`                           | Optional | Last redacted invocation report, returned only after checkpoint ownership is released.                      |
| `tasks`       | `readonly Readonly<TaskRecord>[]`                     | Required | Read-only task key, status and attempt summaries; private interaction state and outputs are omitted.        |
| `usage`       | `WorkflowUsage \| undefined`                          | Optional | Persisted cumulative attempts and token accounting, including interrupted attempts.                         |
| `workspaces`  | `Readonly<Record<string, RecipeWorkspaceCheckpoint>>` | Required | Persisted allocation state and original Git workspace identity for each runtime-owned resource.             |

## Signature

```ts
export interface RecipeRunStatus {
  readonly runId: string;
  readonly revision: string;
  readonly owned: boolean;
  readonly executionId?: string;
  readonly report?: RecipeReport;
  readonly tasks: WorkflowCheckpoint["records"];
  readonly usage?: WorkflowCheckpoint["usage"];
  readonly workspaces: Readonly<Record<string, RecipeWorkspaceCheckpoint>>;
}
```

## Related contracts

- [RecipeReport](../support-recipereport/)
- [RecipeWorkspaceCheckpoint](../support-recipeworkspacecheckpoint/)
- [WorkflowCheckpoint](../workflowcheckpoint/)
