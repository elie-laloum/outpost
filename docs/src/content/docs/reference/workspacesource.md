---
title: "WorkspaceSource"
description: "WorkspaceSource — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkspaceSource } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name         | Type                                                                                                             | Presence          | Meaning                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------- |
| `kind`       | `"directory" \| "ephemeral" \| "git"`                                                                            | Required          | Discriminant selecting Git, a directory source or an initially empty workspace.                       |
| `directory`  | `string`                                                                                                         | Variant-dependent | Absolute local materialization or source directory; it is not a portable resource identity.           |
| `access`     | `{ readonly mode: "copy"; } \| { readonly mode: "mount"; readonly target: string; readonly readOnly: boolean; }` | Variant-dependent | Copy isolates source changes; mount exposes the full source at target with an explicit readOnly flag. |
| `repository` | `string \| undefined`                                                                                            | Variant-dependent | Git repository location; file modes refuse this option before allocation.                             |
| `branch`     | `BranchPolicy \| undefined`                                                                                      | Variant-dependent | Git branch policy retained only for Git sources; file results contain no synthetic branch.            |
| `copies`     | `readonly string[] \| undefined`                                                                                 | Variant-dependent | Legacy Git worktree copies; use declared file inputs or selection for file workspaces.                |
| `guard`      | `DiffGuard \| undefined`                                                                                         | Variant-dependent | Committed Git diff guard; unavailable for directory and ephemeral workspaces.                         |

## Signature

```ts
export type WorkspaceSource = GitWorkspaceSource | FileWorkspaceSource;
```

## Related contracts

- [FileWorkspaceSource](../fileworkspacesource/)
- [GitWorkspaceSource](../gitworkspacesource/)
