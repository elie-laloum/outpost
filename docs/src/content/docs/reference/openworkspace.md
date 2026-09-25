---
title: "openWorkspace"
description: "openWorkspace — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { openWorkspace } from "@elie-laloum/outpost";
```

## Purpose and behavior

Acquire a repository lock and prepare the checkout selected by the branch policy. The returned workspace can own several successive sandboxes and remains open until explicitly closed. integrate applies its branch changes; close preserves work that cannot safely be removed.

[Complete example and detailed rules](../../guide/environment/workspaces/).

## Parameters and properties

| Name                   | Type                                                     | Presence | Meaning                                                                                           |
| ---------------------- | -------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `options`              | `WorkspaceOptions \| undefined`                          | Optional | Repository, branch policy, copied inputs, hooks and storage admission settings.                   |
| `options.storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optional | Admission limits and requested reservation for storage under the repository’s .outpost directory. |
| `options.signal`       | `AbortSignal \| undefined`                               | Optional | Cooperative cancellation for this operation.                                                      |
| `options.repository`   | `string \| undefined`                                    | Optional | Target host Git checkout.                                                                         |
| `options.branch`       | `BranchPolicy \| undefined`                              | Optional | Select the current checkout, a retained named work branch or a branch prepared for integration.   |
| `options.copies`       | `readonly string[] \| undefined`                         | Optional | Repository-relative inputs copied into the workspace.                                             |
| `options.limits`       | `StageLimits \| undefined`                               | Optional | Timeouts for copying, Git preparation, commit collection and integration, in milliseconds.        |
| `options.label`        | `string \| undefined`                                    | Optional | Human-readable label used in execution reporting.                                                 |
| `options.hooks`        | `LifecycleHooks \| undefined`                            | Optional | Lifecycle commands in declared execution order.                                                   |

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
