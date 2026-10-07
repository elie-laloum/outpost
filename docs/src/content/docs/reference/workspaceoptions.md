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

| Name           | Type                                                     | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------- | -------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `guard`        | `DiffGuard \| undefined`                                 | Optional | Optional committed-diff policy owned by this workspace and reused by every sandbox and agent. Requires named or integrate; current fails with code configuration before execution. Successful dispatches and terminal sessions check it after synchronization; integrate checks again under the merge lock. Refusal throws code guard and retains the branch and worktree when this workspace closes, even without preserve. Named workspaces compare their opening commit with the current commit across executions; integration workspaces compare the candidate with its unique merge base with the host, including inherited commits. |
| `observation`  | `ObservationHub \| undefined`                            | Optional | Hub that receives this workspace's Git, copy, hook, integration and cleanup operations. The caller keeps ownership; the workspace never closes it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optional | Storage admission checked before the workspace opens: reserves reserveBytes and fails with code configuration when usage under .outpost plus active reservations would exceed maxBytes. The reservation is released when the workspace closes.                                                                                                                                                                                                                                                                                                                                                                                            |
| `signal`       | `AbortSignal \| undefined`                               | Optional | Cancels opening: checked before allocation and passed to the storage reservation and workspaceReady commands. An open workspace ignores it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `repository`   | `string \| undefined`                                    | Optional | Path inside the host Git checkout, default the process working directory. Outpost works from the checkout's top-level directory; an unavailable directory fails with code workspace.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `branch`       | `BranchPolicy \| undefined`                              | Optional | Branch policy: current, named or integrate. Default { mode: "current" }; createSandbox() and dispatch() on a remote provider default to integrate.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `copies`       | `readonly string[] \| undefined`                         | Optional | Repository-relative files or directories copied from the host checkout into the new worktree before workspaceReady; missing entries are skipped. Requires named or integrate, and absolute, .. or .git paths fail with code configuration. An untracked or ignored copy keeps the worktree when it closes. On a remote provider without includeUncommitted, a copy not ignored by a committed .gitignore makes the first synchronization fail with code workspace.                                                                                                                                                                        |
| `limits`       | `StageLimits \| undefined`                               | Optional | Deadlines in milliseconds for copying, Git preparation, commit collection and integration. Past a deadline the stage fails with code timeout, or conflict for integration. collectMs also bounds each Git command inspecting a diff guard; incomplete inspection fails with code guard.                                                                                                                                                                                                                                                                                                                                                   |
| `label`        | `string \| undefined`                                    | Optional | Name used in the integrate branch (outpost/&lt;label>-&lt;id>), the worktree directory under .outpost/workspaces and the startup-failure journal; lowercased, other characters replaced by -, cut to 48.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `hooks`        | `LifecycleHooks \| undefined`                            | Optional | Setup commands: workspaceReady once when the workspace opens, then hostReady and sandboxReady for each sandbox on it unless that sandbox passes its own hooks. Each command stops after 600000 (10 minutes) unless it sets deadlineMs; a nonzero exit fails with code process.                                                                                                                                                                                                                                                                                                                                                            |

## Signature

```ts
export interface WorkspaceOptions {
  readonly guard?: DiffGuard;
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
- [DiffGuard](../diffguard/)
- [LifecycleHooks](../lifecyclehooks/)
- [ObservationHub](../observationhub/)
- [StageLimits](../stagelimits/)
- [StorageReservationOptions](../storagereservationoptions/)
