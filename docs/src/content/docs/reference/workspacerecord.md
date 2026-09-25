---
title: "WorkspaceRecord"
description: "WorkspaceRecord — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkspaceRecord**. See the [workspaces guide](../../guide/environment/workspaces/) for behavior, defaults and examples.

## Import

```ts
import type { WorkspaceRecord } from "@elie-laloum/outpost";
```

## Purpose and behavior

Own a repository checkout, branch and lock independently of sandbox lifetime.

Repository defaults to the current working directory. Named branches retain commits; dirty or detached worktrees remain recoverable. Close the sandbox before its caller-owned workspace.

[Complete example and detailed rules](../../guide/environment/workspaces/).

## Parameters and properties

| Name             | Type                | Presence | Meaning                                                                        |
| ---------------- | ------------------- | -------- | ------------------------------------------------------------------------------ |
| `repository`     | `string`            | Required | Target host Git checkout.                                                      |
| `directory`      | `string`            | Required | Filesystem directory used by the owning operation; see path rules.             |
| `branch`         | `string`            | Required | Git workspace policy or resulting branch identity, according to this contract. |
| `baseBranch`     | `string`            | Required | See the linked contract and this family's rules for its interpretation.        |
| `baseline`       | `string`            | Required | See the linked contract and this family's rules for its interpretation.        |
| `gitDirectories` | `readonly string[]` | Required | See the linked contract and this family's rules for its interpretation.        |
| `policy`         | `BranchPolicy`      | Required | See the linked contract and this family's rules for its interpretation.        |

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
