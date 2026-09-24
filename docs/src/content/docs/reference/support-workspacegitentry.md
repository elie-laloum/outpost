---
title: "WorkspaceGitEntry"
description: "WorkspaceGitEntry — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Signature

```ts
export type WorkspaceGitEntry = Pick<StorageEntry, "name" | "path"> &
  WorkspaceGitState;
```

## Related contracts

- [StorageEntry](../support-storageentry/)
- [WorkspaceGitState](../support-workspacegitstate/)
