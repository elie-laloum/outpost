---
title: "Core concepts and ownership"
description: "Core concepts and ownership — Outpost"
sidebar:
  order: 3
---

## Four building blocks

| Concept       | Responsibility                                | Typical lifetime            |
| ------------- | --------------------------------------------- | --------------------------- |
| Workspace     | Git checkout, branch, locks and integration   | One feature or several jobs |
| Sandbox       | Running environment attached to one workspace | One job or a warm session   |
| Agent adapter | Native CLI command and event translation      | Reusable configuration      |
| Workflow task | Typed operation and dependencies              | One node in a graph         |

A conversation is separate: its native transcript can survive the sandbox and be resumed later. Forking a conversation does not fork its files.

## Pick the right entry point

Use `dispatch` for one job with automatic resource cleanup. Use `createSandbox` to reuse installed dependencies and in-memory environment state. Use `openWorkspace` when multiple environments or agents should work on the same branch over time. Use `attach` to open a native interactive agent session.

`dispatch` and `attach` close resources they created. A caller-supplied workspace remains the caller’s responsibility. Close a sandbox before its workspace. Handles support `await using`, or explicit, idempotent `close()` calls.

One sandbox accepts one operation at a time. One workspace belongs to one active sandbox at a time. For parallel tasks, allocate separate workspaces and sandboxes. Workflow concurrency does not remove these ownership rules.

## Cleanup preserves work

Closing a clean managed worktree removes its directory; named branches remain. Dirty worktrees are retained, and the close result provides `retainedDirectory`. Use `close({ preserve: true })` to keep a clean worktree too. Current-checkout mode does not remove your project directory.

See [resource lifecycle](../../sandboxes/lifecycle/), [recovery](../../operations/recovery/) and [security boundaries](../../operations/security/).
