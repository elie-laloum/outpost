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

| Name           | Type                                                     | Presence | Meaning                                                                                           |
| -------------- | -------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optional | Admission limits and requested reservation for storage under the repository’s .outpost directory. |
| `signal`       | `AbortSignal \| undefined`                               | Optional | Cooperative cancellation for this operation.                                                      |
| `repository`   | `string \| undefined`                                    | Optional | Target host Git checkout.                                                                         |
| `branch`       | `BranchPolicy \| undefined`                              | Optional | Select the current checkout, a retained named work branch or a branch prepared for integration.   |
| `copies`       | `readonly string[] \| undefined`                         | Optional | Repository-relative inputs copied into the workspace.                                             |
| `limits`       | `StageLimits \| undefined`                               | Optional | Timeouts for copying, Git preparation, commit collection and integration, in milliseconds.        |
| `label`        | `string \| undefined`                                    | Optional | Human-readable label used in execution reporting.                                                 |
| `hooks`        | `LifecycleHooks \| undefined`                            | Optional | Lifecycle commands in declared execution order.                                                   |

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
