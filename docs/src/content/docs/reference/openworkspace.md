---
title: "openWorkspace"
description: "openWorkspace — Outpost API"
sidebar:
  order: 10
---

Public contract for **openWorkspace**. See the [workspaces guide](../../guide/environment/workspaces/) for behavior, defaults and examples.

## Import

```ts
import { openWorkspace } from "@elie-laloum/outpost";
```

## Purpose and behavior

Own a repository checkout, branch and lock independently of sandbox lifetime.

Repository defaults to the current working directory. Named branches retain commits; dirty or detached worktrees remain recoverable. Close the sandbox before its caller-owned workspace.

[Complete example and detailed rules](../../guide/environment/workspaces/).

## Parameters and properties

| Name                   | Type                                                     | Presence | Meaning                                                                                  |
| ---------------------- | -------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`              | `WorkspaceOptions \| undefined`                          | Optional | Configuration object. Its fields are described in the associated options contract below. |
| `options.storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.signal`       | `AbortSignal \| undefined`                               | Optional | Cooperative cancellation for this operation.                                             |
| `options.repository`   | `string \| undefined`                                    | Optional | Target host Git checkout.                                                                |
| `options.branch`       | `BranchPolicy \| undefined`                              | Optional | Git workspace policy or resulting branch identity, according to this contract.           |
| `options.copies`       | `readonly string[] \| undefined`                         | Optional | Repository-relative inputs copied into the workspace.                                    |
| `options.limits`       | `StageLimits \| undefined`                               | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.label`        | `string \| undefined`                                    | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.hooks`        | `LifecycleHooks \| undefined`                            | Optional | Lifecycle commands in declared execution order.                                          |

## Returns

`Promise<Workspace>`

## Signature

```ts
export declare function openWorkspace(
  options?: WorkspaceOptions,
): Promise<Workspace>;
```

## Related contracts

- [Workspace](../workspace/)
- [WorkspaceOptions](../workspaceoptions/)
