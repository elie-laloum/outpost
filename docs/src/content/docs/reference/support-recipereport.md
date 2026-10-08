---
title: "RecipeReport"
description: "RecipeReport — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name             | Type                                                                                            | Presence | Meaning                                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `observerErrors` | `readonly RecipeDiagnostic[] \| undefined`                                                      | Optional | Failures while closing owned observer components, reported without changing the execution status. Secret values selected by this runtime are redacted. |
| `name`           | `string`                                                                                        | Required | Recipe name associated with this invocation.                                                                                                           |
| `executionId`    | `string \| undefined`                                                                           | Optional | Workflow execution identifier, present once the workflow has started.                                                                                  |
| `status`         | `"failed" \| "done" \| "cancelled" \| "rejected" \| "waiting-input" \| "paused"`                | Required | Final invocation status including integration, cancellation and sandbox cleanup.                                                                       |
| `workflowStatus` | `"failed" \| "done" \| "cancelled" \| "rejected" \| "waiting-input" \| "paused" \| undefined`   | Optional | Workflow task outcome before integration and cleanup.                                                                                                  |
| `tasks`          | `readonly Readonly<TaskRecord>[]`                                                               | Required | Task execution records returned by the workflow.                                                                                                       |
| `usage`          | `WorkflowUsage \| undefined`                                                                    | Optional | Aggregated workflow usage when an execution result is available.                                                                                       |
| `outputs`        | `Readonly<Record<string, Readonly<Record<string, string \| number>>>>`                          | Required | Bounded scalar outputs of completed recipe tasks, keyed by task name.                                                                                  |
| `errors`         | `readonly RecipeDiagnostic[]`                                                                   | Required | Bounded diagnostics for task, integration and cleanup failures.                                                                                        |
| `workspace`      | `{ readonly branch: string; readonly directory: string; readonly retainedDirectory?: string; }` | Required | Workspace branch and directory, including retainedDirectory when work was preserved.                                                                   |

## Signature

```ts
export interface RecipeReport {
  readonly observerErrors?: readonly RecipeDiagnostic[];
  readonly name: string;
  readonly executionId?: string;
  readonly status: WorkflowResult["status"];
  readonly workflowStatus?: WorkflowResult["status"];
  readonly tasks: WorkflowResult["tasks"];
  readonly usage?: WorkflowResult["usage"];
  readonly outputs: Readonly<
    Record<string, Readonly<Record<string, string | number>>>
  >;
  readonly errors: readonly RecipeDiagnostic[];
  readonly workspace: {
    readonly branch: string;
    readonly directory: string;
    readonly retainedDirectory?: string;
  };
}
```

## Related contracts

- [RecipeDiagnostic](../support-recipediagnostic/)
- [WorkflowResult](../workflowresult/)
