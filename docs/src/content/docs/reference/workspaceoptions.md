---
title: "WorkspaceOptions"
description: "WorkspaceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                                                     | Presence | Meaning                                                                                                                                                                                           |
| -------------- | -------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `observation`  | `ObservationHub \| undefined`                            | Optional | Optional caller-owned hub for workspace, allocation, transfer and cleanup operations; creating a workspace does not close the hub.                                                                |
| `storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optional | Admission limits and requested reservation for storage under the repository’s .outpost directory.                                                                                                 |
| `signal`       | `AbortSignal \| undefined`                               | Optional | Cooperative cancellation for this operation.                                                                                                                                                      |
| `repository`   | `string \| undefined`                                    | Optional | Target host Git checkout.                                                                                                                                                                         |
| `branch`       | `BranchPolicy \| undefined`                              | Optional | Select the current checkout, a retained named work branch or a branch prepared for integration.                                                                                                   |
| `copies`       | `readonly string[] \| undefined`                         | Optional | Repository-relative inputs copied into the workspace.                                                                                                                                             |
| `limits`       | `StageLimits \| undefined`                               | Optional | Timeouts for copying, Git preparation, commit collection and integration, in milliseconds.                                                                                                        |
| `label`        | `string \| undefined`                                    | Optional | Human-readable label used in execution reporting.                                                                                                                                                 |
| `hooks`        | `LifecycleHooks \| undefined`                            | Optional | Lifecycle commands: workspaceReady runs on the host once the worktree exists; hostReady (in order, on the host) and sandboxReady (in parallel, in the sandbox) run concurrently after allocation. |

## Signature

```ts
export interface WorkspaceOptions {
  readonly observation?: ObservationHub;
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
- [ObservationHub](../observationhub/)
- [StageLimits](../stagelimits/)
- [StorageReservationOptions](../storagereservationoptions/)
