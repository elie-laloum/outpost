---
title: "RecipeWorkspaceReport"
description: "RecipeWorkspaceReport — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name                | Type                               | Presence          | Meaning                                                                                                 |
| ------------------- | ---------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------- |
| `kind`              | `"git" \| "files"`                 | Required          | git for a named Git workspace, files for a named file workspace; selects the other fields.              |
| `integration`       | `ConflictResolution \| undefined`  | Variant-dependent | Git workspaces: conflict resolution of this workspace’s integration.                                    |
| `branch`            | `string`                           | Variant-dependent | Git workspaces: branch of the managed worktree.                                                         |
| `directory`         | `string`                           | Variant-dependent | Git workspaces: worktree directory shared by every sandbox of this workspace.                           |
| `retainedDirectory` | `string \| undefined`              | Variant-dependent | Git workspaces: worktree kept for review when the workspace was not integrated.                         |
| `workspaceInfo`     | `FileWorkspaceRecord \| undefined` | Variant-dependent | File workspaces: versioned description retaining ownership, settled generation and recovery references. |
| `fileOutputs`       | `readonly WorkspacePublication[]`  | Variant-dependent | File workspaces: verified publications of the outputs this workspace declares.                          |

## Signature

```ts
export type RecipeWorkspaceReport =
  RecipeGitWorkspaceReport | RecipeFileWorkspaceReport;
```

## Related contracts

- [RecipeFileWorkspaceReport](../support-recipefileworkspacereport/)
- [RecipeGitWorkspaceReport](../support-recipegitworkspacereport/)
