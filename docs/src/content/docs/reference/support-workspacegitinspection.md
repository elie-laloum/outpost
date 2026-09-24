---
title: "WorkspaceGitInspection"
description: "WorkspaceGitInspection — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Signature

```ts
export interface WorkspaceGitInspection {
  readonly complete: boolean;
  readonly workspaces: readonly WorkspaceGitEntry[];
  readonly issues: readonly StorageIssue[];
}
```

## Related contracts

- [StorageIssue](../support-storageissue/)
- [WorkspaceGitEntry](../support-workspacegitentry/)
