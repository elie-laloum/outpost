---
title: "WorkspaceGitInspection"
description: "WorkspaceGitInspection — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Signature

```ts
export interface WorkspaceGitInspection {
  readonly complete: boolean;
  readonly workspaces: readonly WorkspaceGitEntry[];
  readonly issues: readonly StorageIssue[];
}
```

## Contrats associés

- [StorageIssue](../support-storageissue/)
- [WorkspaceGitEntry](../support-workspacegitentry/)
