---
title: "RecipeResumeOptions"
description: "RecipeResumeOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeResumeOptions } from "@elie-laloum/outpost/recipes";
```

## Parameters and properties

| Name                | Type                                                                        | Presence | Meaning                                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workspaceRecovery` | `Readonly<Record<string, FileWorkspaceRecoveryAuthorization>> \| undefined` | Optional | Explicit recovery authorizations keyed by shared workspace or task key; checkpoint replay authorization remains separate.                                             |
| `runId`             | `string`                                                                    | Required | Existing checkpoint run ID; a missing run is refused without allocating a workspace.                                                                                  |
| `retryIncomplete`   | `boolean \| undefined`                                                      | Optional | Explicitly authorize the native scheduler to retry incomplete tasks; completed tasks and cumulative usage remain persisted.                                           |
| `answers`           | `readonly WorkflowAnswer[] \| undefined`                                    | Optional | Native answers to pending dialogue requests, including the execution, task, request and authorized actor.                                                             |
| `decisions`         | `readonly WorkflowDecision[] \| undefined`                                  | Optional | Native gate decisions with trusted actor metadata and any required signature proof; verified by the workflow engine.                                                  |
| `recoverRevision`   | `string \| undefined`                                                       | Optional | Explicitly recover checkpoint ownership at this exact storage revision after stopping its previous coordinator; does not recover workspace locks or authorize replay. |
| `inputs`            | `Readonly<Record<string, WorkflowJson>> \| undefined`                       | Optional | Optional original input values; omitted values reload from the checkpoint and changed values reject resume.                                                           |
| `signal`            | `AbortSignal \| undefined`                                                  | Optional | Cancel this invocation while awaiting owned-resource cleanup.                                                                                                         |
| `report`            | `"json" \| undefined`                                                       | Optional | Explicitly replace configured final reports with one JSON report on stdout; does not enable observation.                                                              |

## Signature

```ts
export interface RecipeResumeOptions extends RecipeRunOptions {
  readonly workspaceRecovery?: Readonly<
    Record<string, FileWorkspaceRecoveryAuthorization>
  >;
  readonly runId: string;
  readonly retryIncomplete?: boolean;
  readonly answers?: readonly WorkflowAnswer[];
  readonly decisions?: readonly WorkflowDecision[];
  readonly recoverRevision?: string;
}
```

## Related contracts

- [RecipeRunOptions](../reciperunoptions/)
- [WorkflowAnswer](../workflowanswer/)
- [WorkflowDecision](../workflowdecision/)
