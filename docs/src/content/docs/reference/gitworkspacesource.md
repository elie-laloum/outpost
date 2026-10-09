---
title: "GitWorkspaceSource"
description: "GitWorkspaceSource — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { GitWorkspaceSource } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                             | Presence | Meaning                                                                                    |
| ------------ | -------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `kind`       | `"git"`                          | Required | Discriminant selecting Git, a directory source or an initially empty workspace.            |
| `repository` | `string \| undefined`            | Optional | Git repository location; file modes refuse this option before allocation.                  |
| `branch`     | `BranchPolicy \| undefined`      | Optional | Git branch policy retained only for Git sources; file results contain no synthetic branch. |
| `copies`     | `readonly string[] \| undefined` | Optional | Legacy Git worktree copies; use declared file inputs or selection for file workspaces.     |
| `guard`      | `DiffGuard \| undefined`         | Optional | Committed Git diff guard; unavailable for directory and ephemeral workspaces.              |

## Signature

```ts
export interface GitWorkspaceSource {
  readonly kind: "git";
  readonly repository?: string;
  readonly branch?: BranchPolicy;
  readonly copies?: readonly string[];
  readonly guard?: DiffGuard;
}
```

## Related contracts

- [BranchPolicy](../branchpolicy/)
- [DiffGuard](../diffguard/)
