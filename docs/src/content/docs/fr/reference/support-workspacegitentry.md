---
title: "WorkspaceGitEntry"
description: "WorkspaceGitEntry — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Signature

```ts
export type WorkspaceGitEntry = Pick<StorageEntry, "name" | "path"> &
  WorkspaceGitState;
```

## Contrats associés

- [StorageEntry](../support-storageentry/)
- [WorkspaceGitState](../support-workspacegitstate/)
