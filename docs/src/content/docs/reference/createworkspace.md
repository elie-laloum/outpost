---
title: "createWorkspace"
description: "createWorkspace — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createWorkspace } from "@elie-laloum/outpost";
```

## Purpose and behavior

Creates an owned Git, copied-directory, mounted-directory or ephemeral workspace. File modes allocate no Git repository and publish nothing on closure.

[Complete example and detailed rules](../../guide/workspaces/).

## Parameters and properties

| Name                   | Type                                                     | Presence | Meaning                                                                                                                                                                                                                                                                                 |
| ---------------------- | -------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`              | `GitWorkspaceOptions \| FileWorkspaceOptions`            | Required | Options selecting source, execution capabilities or inspected recovery preconditions for this operation.                                                                                                                                                                                |
| `options.source`       | `GitWorkspaceSource \| FileWorkspaceSource`              | Required | Declared source for an owned resource; mutually exclusive with borrowing an open workspace.                                                                                                                                                                                             |
| `options.hooks`        | `LifecycleHooks \| undefined`                            | Optional | Setup commands: workspaceReady once when the workspace opens, then hostReady and sandboxReady for each sandbox on it unless that sandbox passes its own hooks. Each command stops after 600000 (10 minutes) unless it sets deadlineMs; a nonzero exit fails with code process.          |
| `options.signal`       | `AbortSignal \| undefined`                               | Optional | Cancels opening: checked before allocation and passed to the storage reservation and workspaceReady commands. An open workspace ignores it.                                                                                                                                             |
| `options.storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optional | Storage admission checked before the workspace opens: reserves reserveBytes and fails with code configuration when usage under .outpost plus active reservations would exceed maxBytes. The reservation is released when the workspace closes.                                          |
| `options.observation`  | `ObservationHub \| undefined`                            | Optional | Hub that receives this workspace's Git, copy, hook, integration and cleanup operations. The caller keeps ownership; the workspace never closes it.                                                                                                                                      |
| `options.limits`       | `StageLimits \| undefined`                               | Optional | Deadlines in milliseconds for copying, Git preparation, commit collection and integration. Past a deadline the stage fails with code timeout, or conflict for integration. collectMs also bounds each Git command inspecting a diff guard; incomplete inspection fails with code guard. |
| `options.label`        | `string \| undefined`                                    | Optional | Name used in the integrate branch (outpost/&lt;label>-&lt;id>), the worktree directory under .outpost/workspaces and the startup-failure journal; lowercased, other characters replaced by -, cut to 48.                                                                                |
| `options.recovery`     | `FileWorkspaceRecoveryAuthorization \| undefined`        | Optional | Explicit stopped-process recovery authorization; interrupted replay remains a separate workflow decision.                                                                                                                                                                               |
| `options.inputs`       | `readonly WorkspaceInput[] \| undefined`                 | Optional | Explicit file inputs; JSON workflow parameters are never implicitly written to disk.                                                                                                                                                                                                    |
| `options.runtime`      | `WorkspaceRuntimeOptions \| undefined`                   | Optional | Control directory and logical namespace, separate from the workspace files.                                                                                                                                                                                                             |
| `options.paths`        | `readonly string[] \| undefined`                         | Optional | Explicit relative path selection; copy selection does not implicitly apply .gitignore.                                                                                                                                                                                                  |
| `options.retention`    | `WorkspaceRetention \| undefined`                        | Optional | run cleans successful owned work, local retains it, portable additionally requires an explicit Transport and namespace.                                                                                                                                                                 |

## Returns

`Promise<GitWorkspace>` · `Promise<FileWorkspace>`

## Signature

```ts
export declare function createWorkspace(
  options: GitWorkspaceOptions,
): Promise<GitWorkspace>;
```

## Related contracts

- [FileWorkspace](../fileworkspace/)
- [FileWorkspaceOptions](../fileworkspaceoptions/)
- [GitWorkspace](../gitworkspace/)
- [GitWorkspaceOptions](../gitworkspaceoptions/)
