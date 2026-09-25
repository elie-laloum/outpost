---
title: "WorkspaceGitInspection"
description: "WorkspaceGitInspection — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name         | Type                           | Presence | Meaning                                                                 |
| ------------ | ------------------------------ | -------- | ----------------------------------------------------------------------- |
| `complete`   | `boolean`                      | Required | See the linked contract and this family's rules for its interpretation. |
| `workspaces` | `readonly WorkspaceGitEntry[]` | Required | See the linked contract and this family's rules for its interpretation. |
| `issues`     | `readonly StorageIssue[]`      | Required | See the linked contract and this family's rules for its interpretation. |

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
