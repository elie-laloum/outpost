---
title: "Workspaces — Overview"
description: "A workspace owns a task’s Git state: the checkout or worktree, its branch, its lock and when work merges."
sidebar:
  label: Overview
  order: 0
---

## Choose a branch policy

`branch` decides where the agent works and what `integrate()` and `close()` do. A lock already held fails with code `conflict` instead of waiting.

| Mode        | The agent works in                                | Lock held on | `integrate()`                  | Clean `close()`                             |
| ----------- | ------------------------------------------------- | ------------ | ------------------------------ | ------------------------------------------- |
| `current`   | Your checkout, on its checked-out branch          | The checkout | Does nothing                   | Leaves everything in place                  |
| `named`     | A worktree under `.outpost/workspaces/` on `name` | That branch  | Does nothing                   | Removes the worktree, keeps the branch      |
| `integrate` | A worktree on a new `outpost/<label>-<id>` branch | That branch  | Merges it into the base branch | Removes the worktree, deletes merged branch |

`copies` requires `named` or `integrate`, and remote sandbox providers reject `current`.

## Lifecycle

A workspace outlives its sandboxes: it serves one sandbox at a time and stays open until you close it.

| Call                                                 | Sandbox                              | Git effect                                                                    |
| ---------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------- |
| `openWorkspace(options)`                             | None                                 | Takes the lock, prepares the worktree, copies `copies`, runs `workspaceReady` |
| `workspace.sandbox()`                                | New, open until you close it         | None; closing it leaves the workspace open and unmerged                       |
| `workspace.dispatch()` / `workspace.attach()`        | New, closed after the run            | Merges an `integrate` branch when the run succeeds                            |
| `workspace.integrate()`                              | —                                    | `git merge` into the base branch; `conflict` if the host branch changed       |
| `workspace.close()`                                  | Must already be closed               | Releases the lock and removes a clean worktree                                |
| `dispatch()` / `createSandbox()` without `workspace` | Owns a workspace it opens and closes | Same policy, closed with the sandbox                                          |

:::note
Closing keeps a worktree with a detached `HEAD` or uncommitted, untracked or ignored files, copies included, and returns it as `retainedDirectory`. Outpost never pushes a branch.
:::

## Entry points

Guide: [Repository and branch](../../../guide/repository-and-branch/) · [Sandbox sessions](../../../guide/sandbox-sessions/) · [Recover work](../../../guide/recovery/)

- [openWorkspace](../../openworkspace/)
- [Workspace](../../workspace/)
- [WorkspaceOptions](../../workspaceoptions/)
- [BranchPolicy](../../branchpolicy/)
- [LifecycleHooks](../../lifecyclehooks/)
- [StageLimits](../../stagelimits/)
- [WorkspaceRecord](../../workspacerecord/)
- [Disposal](../../disposal/)
