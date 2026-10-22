---
title: "RecipeGitWorkspaceReport"
description: "RecipeGitWorkspaceReport — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name                | Type                              | Presence | Meaning                                                                                                                              |
| ------------------- | --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `kind`              | `"git"`                           | Required | Identifies a named Git workspace report.                                                                                             |
| `integration`       | `ConflictResolution \| undefined` | Optional | Conflict resolution of this workspace’s integration, reported separately from workflow usage.                                        |
| `branch`            | `string`                          | Required | Branch of the named workspace’s managed worktree.                                                                                    |
| `directory`         | `string`                          | Required | Worktree directory shared by every sandbox of this workspace.                                                                        |
| `retainedDirectory` | `string \| undefined`             | Optional | Worktree kept for review when this workspace was not integrated, for example after a failure, cancellation or a named branch policy. |

## Signature

```ts
export interface RecipeGitWorkspaceReport extends NonNullable<
  RecipeReport["workspace"]
> {
  readonly kind: "git";
  readonly integration?: ConflictResolution;
}
```

## Related contracts

- [RecipeReport](../support-recipereport/)
