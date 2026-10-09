---
title: "FileWorkspaceOptions"
description: "FileWorkspaceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileWorkspaceOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                                                     | Presence | Meaning                                                                                                                 |
| -------------- | -------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `hooks`        | `LifecycleHooks \| undefined`                            | Optional | Declared workspaceReady, hostReady and sandboxReady preparation commands.                                               |
| `storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optional | Admission reservation through Transport; coordinates cooperating writers without enforcing a physical disk quota.       |
| `recovery`     | `FileWorkspaceRecoveryAuthorization \| undefined`        | Optional | Explicit stopped-process recovery authorization; interrupted replay remains a separate workflow decision.               |
| `inputs`       | `readonly WorkspaceInput[] \| undefined`                 | Optional | Explicit file inputs; JSON workflow parameters are never implicitly written to disk.                                    |
| `source`       | `FileWorkspaceSource`                                    | Required | Declared source for an owned resource; mutually exclusive with borrowing an open workspace.                             |
| `runtime`      | `WorkspaceRuntimeOptions \| undefined`                   | Optional | Control directory and logical namespace, separate from the workspace files.                                             |
| `paths`        | `readonly string[] \| undefined`                         | Optional | Explicit relative path selection; copy selection does not implicitly apply .gitignore.                                  |
| `retention`    | `WorkspaceRetention \| undefined`                        | Optional | run cleans successful owned work, local retains it, portable additionally requires an explicit Transport and namespace. |
| `signal`       | `AbortSignal \| undefined`                               | Optional | Cancellation signal propagated to the operation and its process group; reusable sandboxes remain usable.                |

## Signature

```ts
export interface FileWorkspaceOptions {
  readonly hooks?: LifecycleHooks;
  readonly storageQuota?: Omit<StorageReservationOptions, "signal">;
  readonly recovery?: FileWorkspaceRecoveryAuthorization;
  readonly inputs?: readonly WorkspaceInput[];
  readonly source: FileWorkspaceSource;
  readonly runtime?: WorkspaceRuntimeOptions;
  readonly paths?: readonly string[];
  readonly retention?: WorkspaceRetention;
  readonly signal?: AbortSignal;
}
```

## Related contracts

- [FileWorkspaceRecoveryAuthorization](../fileworkspacerecoveryauthorization/)
- [FileWorkspaceSource](../fileworkspacesource/)
- [WorkspaceInput](../workspaceinput/)
- [WorkspaceRetention](../workspaceretention/)
- [WorkspaceRuntimeOptions](../workspaceruntimeoptions/)
