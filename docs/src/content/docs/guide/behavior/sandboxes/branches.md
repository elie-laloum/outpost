---
title: "Branch policies and integration"
description: "Branch policies and integration — Outpost"
sidebar:
  order: 3
---

Choose how agent changes relate to your host checkout before starting a job.

| Policy                                                 | Behavior                                                                              |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `{ mode: "current" }`                                  | Uses your existing checkout. Default for mounted and host providers.                  |
| `{ mode: "named", name: "feature/fix", from: "main" }` | Creates or reuses a managed worktree for the named branch.                            |
| `{ mode: "integrate", from: "main" }`                  | Creates a temporary branch whose commits can be merged into the original host branch. |

`from` is optional and accepts a Git commit-ish. Remote providers default to `integrate` and reject `current`.

## Integration rules

One-shot dispatch integrates committed changes when requested. Warm sandboxes integrate only when you call `sandbox.workspace.integrate()`. Integration requires an attached host branch, uses a merge lock, and refuses an unexpected host branch change. It does not switch the host checkout to the agent branch.

Uncommitted changes are preserved in the workspace; they are not magically converted into commits. A merge conflict retains the managed workspace for inspection. Inspect `retainedDirectory` or [recovery metadata](../../../operations/recovery/) before cleanup.

Managed worktrees live in `.outpost/workspaces`. If a named branch is already checked out at a different location, Outpost fails instead of moving it. Existing named branches are reused. Closing a clean worktree removes its directory but keeps the named branch.

## Parallel work

Give parallel jobs distinct branch names. Host integration is serialized, but serialization cannot resolve semantic conflicts between independently developed changes. Use an explicit review/integration phase for related work.

Locks record the owner PID. Active ownership prevents conflicting operations; dead-owner locks can be recovered. Do not remove a live lock to force concurrent access.
