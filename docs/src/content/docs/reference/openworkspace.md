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

Open a workspace on a host Git checkout: take its lock, prepare the checkout or worktree the branch policy selects, copy copies, then run workspaceReady. It serves successive sandboxes, one at a time, until close(). A lock held by a live process fails with code conflict instead of waiting.

[Complete example and detailed rules](../../guide/git-workspaces/).

## Parameters and properties

| Name                   | Type                                                     | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------- | -------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`              | `WorkspaceOptions \| undefined`                          | Optional | Repository, branch policy, copies, hooks, stage deadlines, storage quota, label, cancellation signal and observation hub.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `options.guard`        | `DiffGuard \| undefined`                                 | Optional | Optional committed-diff policy owned by this workspace and reused by every sandbox and agent. Requires named or integrate; current fails with code configuration before execution. Successful dispatches and terminal sessions check it after synchronization; integrate checks again under the merge lock. Refusal throws code guard and retains the branch and worktree when this workspace closes, even without preserve. Named workspaces compare their opening commit with the current commit across executions; integration workspaces compare the candidate with its unique merge base with the host, including inherited commits. |
| `options.observation`  | `ObservationHub \| undefined`                            | Optional | Hub that receives this workspace's Git, copy, hook, integration and cleanup operations. The caller keeps ownership; the workspace never closes it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `options.storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optional | Storage admission checked before the workspace opens: reserves reserveBytes and fails with code configuration when usage under .outpost plus active reservations would exceed maxBytes. The reservation is released when the workspace closes.                                                                                                                                                                                                                                                                                                                                                                                            |
| `options.signal`       | `AbortSignal \| undefined`                               | Optional | Cancels opening: checked before allocation and passed to the storage reservation and workspaceReady commands. An open workspace ignores it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `options.repository`   | `string \| undefined`                                    | Optional | Path inside the host Git checkout, default the process working directory. Outpost works from the checkout's top-level directory; an unavailable directory fails with code workspace.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `options.branch`       | `BranchPolicy \| undefined`                              | Optional | Branch policy: current, named or integrate. Default { mode: "current" }; createSandbox() and dispatch() on a remote provider default to integrate.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `options.copies`       | `readonly string[] \| undefined`                         | Optional | Repository-relative files or directories copied from the host checkout into the new worktree before workspaceReady; missing entries are skipped. Requires named or integrate, and absolute, .. or .git paths fail with code configuration. An untracked or ignored copy keeps the worktree when it closes. On a remote provider without includeUncommitted, a copy not ignored by a committed .gitignore makes the first synchronization fail with code workspace.                                                                                                                                                                        |
| `options.limits`       | `StageLimits \| undefined`                               | Optional | Deadlines in milliseconds for copying, Git preparation, commit collection and integration. Past a deadline the stage fails with code timeout, or conflict for integration. collectMs also bounds each Git command inspecting a diff guard; incomplete inspection fails with code guard.                                                                                                                                                                                                                                                                                                                                                   |
| `options.label`        | `string \| undefined`                                    | Optional | Name used in the integrate branch (outpost/&lt;label>-&lt;id>), the worktree directory under .outpost/workspaces and the startup-failure journal; lowercased, other characters replaced by -, cut to 48.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `options.hooks`        | `LifecycleHooks \| undefined`                            | Optional | Setup commands: workspaceReady once when the workspace opens, then hostReady and sandboxReady for each sandbox on it unless that sandbox passes its own hooks. Each command stops after 600000 (10 minutes) unless it sets deadlineMs; a nonzero exit fails with code process.                                                                                                                                                                                                                                                                                                                                                            |

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
