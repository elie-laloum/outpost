---
title: "GitWorkspaceOptions"
description: "GitWorkspaceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { GitWorkspaceOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                                                     | Presence | Meaning                                                                                                                                                                                                                                                                                 |
| -------------- | -------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`       | `GitWorkspaceSource`                                     | Required | Declared source for an owned resource; mutually exclusive with borrowing an open workspace.                                                                                                                                                                                             |
| `hooks`        | `LifecycleHooks \| undefined`                            | Optional | Setup commands: workspaceReady once when the workspace opens, then hostReady and sandboxReady for each sandbox on it unless that sandbox passes its own hooks. Each command stops after 600000 (10 minutes) unless it sets deadlineMs; a nonzero exit fails with code process.          |
| `signal`       | `AbortSignal \| undefined`                               | Optional | Cancels opening: checked before allocation and passed to the storage reservation and workspaceReady commands. An open workspace ignores it.                                                                                                                                             |
| `storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optional | Storage admission checked before the workspace opens: reserves reserveBytes and fails with code configuration when usage under .outpost plus active reservations would exceed maxBytes. The reservation is released when the workspace closes.                                          |
| `observation`  | `ObservationHub \| undefined`                            | Optional | Hub that receives this workspace's Git, copy, hook, integration and cleanup operations. The caller keeps ownership; the workspace never closes it.                                                                                                                                      |
| `limits`       | `StageLimits \| undefined`                               | Optional | Deadlines in milliseconds for copying, Git preparation, commit collection and integration. Past a deadline the stage fails with code timeout, or conflict for integration. collectMs also bounds each Git command inspecting a diff guard; incomplete inspection fails with code guard. |
| `label`        | `string \| undefined`                                    | Optional | Name used in the integrate branch (outpost/&lt;label>-&lt;id>), the worktree directory under .outpost/workspaces and the startup-failure journal; lowercased, other characters replaced by -, cut to 48.                                                                                |

## Signature

```ts
export interface GitWorkspaceOptions extends Omit<
  WorkspaceOptions,
  "repository" | "branch" | "copies" | "guard"
> {
  readonly source: GitWorkspaceSource;
}
```

## Related contracts

- [GitWorkspaceSource](../gitworkspacesource/)
- [WorkspaceOptions](../workspaceoptions/)
