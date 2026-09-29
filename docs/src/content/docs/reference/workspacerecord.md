---
title: "WorkspaceRecord"
description: "WorkspaceRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceRecord } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                | Presence | Meaning                                                                                                                                                 |
| ---------------- | ------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repository`     | `string`            | Required | Real path of the host checkout's top-level directory.                                                                                                   |
| `directory`      | `string`            | Required | Host directory the agent works in: the worktree under .outpost/workspaces, or the checkout itself in current mode.                                      |
| `branch`         | `string`            | Required | Work branch name. In current mode, the checked-out branch, or HEAD when detached.                                                                       |
| `baseBranch`     | `string`            | Required | Branch checked out in the host checkout when the workspace opened, and the target of integrate(). Empty when HEAD was detached.                         |
| `baseline`       | `string`            | Required | Commit checked out in the workspace when it opened. Each dispatch lists commits from its own starting commit, not from this one.                        |
| `gitDirectories` | `readonly string[]` | Required | Host paths of the worktree's Git directory and the repository's common Git directory. Container providers mount them unless repositoryMode is isolated. |
| `policy`         | `BranchPolicy`      | Required | Branch policy in effect, { mode: "current" } when none was given.                                                                                       |

## Signature

```ts
export interface WorkspaceRecord {
  readonly repository: string;
  readonly directory: string;
  readonly branch: string;
  readonly baseBranch: string;
  readonly baseline: string;
  readonly gitDirectories: readonly string[];
  readonly policy: BranchPolicy;
}
```

## Related contracts

- [BranchPolicy](../branchpolicy/)
