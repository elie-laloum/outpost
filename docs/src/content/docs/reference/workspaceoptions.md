---
title: "WorkspaceOptions"
description: "WorkspaceOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkspaceOptions**. See the [workspaces guide](../../sandboxes/workspaces/) for behavior, defaults and examples.

## Import

```ts
import type { WorkspaceOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkspaceOptions {
  readonly signal?: AbortSignal;
  readonly repository?: string;
  readonly branch?: BranchPolicy;
  readonly copies?: readonly string[];
  readonly limits?: StageLimits;
  readonly label?: string;
  readonly hooks?: LifecycleHooks;
}
```

## Related contracts

- [BranchPolicy](../branchpolicy/)
- [LifecycleHooks](../lifecyclehooks/)
- [StageLimits](../stagelimits/)
