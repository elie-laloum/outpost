---
title: "WorkspaceOptions"
description: "WorkspaceOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkspaceOptions**. See the [workspaces guide](../../guide/environment/workspaces/) for behavior, defaults and examples.

## Import

```ts
import type { WorkspaceOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Own a repository checkout, branch and lock independently of sandbox lifetime.

Repository defaults to the current working directory. Named branches retain commits; dirty or detached worktrees remain recoverable. Close the sandbox before its caller-owned workspace.

[Complete example and detailed rules](../../guide/environment/workspaces/).

## Parameters and properties

| Name           | Type                                                     | Presence | Meaning                                                                        |
| -------------- | -------------------------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optional | See the linked contract and this family's rules for its interpretation.        |
| `signal`       | `AbortSignal \| undefined`                               | Optional | Cooperative cancellation for this operation.                                   |
| `repository`   | `string \| undefined`                                    | Optional | Target host Git checkout.                                                      |
| `branch`       | `BranchPolicy \| undefined`                              | Optional | Git workspace policy or resulting branch identity, according to this contract. |
| `copies`       | `readonly string[] \| undefined`                         | Optional | Repository-relative inputs copied into the workspace.                          |
| `limits`       | `StageLimits \| undefined`                               | Optional | See the linked contract and this family's rules for its interpretation.        |
| `label`        | `string \| undefined`                                    | Optional | See the linked contract and this family's rules for its interpretation.        |
| `hooks`        | `LifecycleHooks \| undefined`                            | Optional | Lifecycle commands in declared execution order.                                |

## Signature

```ts
export interface WorkspaceOptions {
  readonly storageQuota?: Omit<StorageReservationOptions, "signal">;
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
- [StorageReservationOptions](../storagereservationoptions/)
