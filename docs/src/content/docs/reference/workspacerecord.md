---
title: "WorkspaceRecord"
description: "WorkspaceRecord — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkspaceRecord**. See the [workspaces guide](../../sandboxes/workspaces/) for behavior, defaults and examples.

## Import

```ts
import type { WorkspaceRecord } from "@elie-laloum/outpost";
```

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
