---
title: "Sandboxes — Overview"
description: "Keep one environment open for agent turns, commands and terminal sessions, then close it and the workspace it opened."
sidebar:
  label: Overview
  order: 0
---

## Run operations on an open sandbox

Every call runs on the same provider lease, so files and installed dependencies persist between calls. An `agent` passed to a call replaces the sandbox’s default agent.

| Call                                                        | Runs                                                    | Resolves with                                               |
| ----------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| `sandbox.dispatch(options)`                                 | A brief in a new conversation                           | `WarmDispatchResult`; its `resume()` and `fork()` stay here |
| `sandbox.resume(id, options)` / `sandbox.fork(id, options)` | A captured conversation, or a copy of it                | `WarmDispatchResult`                                        |
| `sandbox.attach(options)`                                   | The agent’s CLI in your terminal, for up to 24 hours    | `AttachResult` with status and commits                      |
| `sandbox.command(command)`                                  | One executable, without a shell                         | `CommandResult`, even for a nonzero status                  |
| `sandbox.diagnose(options)`                                 | Probes for node, git, commands, an agent CLI, transfers | `SandboxDiagnosticReport`                                   |

No call integrates the branch: call `sandbox.workspace.integrate()` before `close()`. On a remote provider, `dispatch`, `attach` and `command` end by pulling the sandbox’s changes into the host worktree.

:::caution
A sandbox runs one operation at a time: a call made while another runs rejects with code `configuration`. Open one sandbox per parallel task.
:::

## Close a sandbox

`await using` calls `close()`; later calls return the first call’s promise. `close()` aborts the running operation, waits for it, then releases the environment.

| Event                            | Workspace opened by `createSandbox()`                                       | Supplied `workspace` |
| -------------------------------- | --------------------------------------------------------------------------- | -------------------- |
| `close()`                        | Closed; worktree removed if clean and attached, else in `retainedDirectory` | Left open            |
| `close({ preserve: true })`      | Closed; worktree kept                                                       | Left open            |
| Release fails during `close()`   | Closed; worktree kept; `close()` rejects                                    | Left open            |
| Setup fails in `createSandbox()` | Closed after the environment is released; the error is rethrown             | Left open            |
| SIGINT or SIGTERM                | Closed by `close({ preserve: true })`                                       | Left open            |

## Entry points

Guide: [Sandbox sessions](../../../guide/sandbox-sessions/) · [Prepare the environment](../../../guide/environment-setup/) · [Cloud sandboxes](../../../guide/cloud-sandboxes/)

- [createSandbox](../../createsandbox/)
- [Sandbox](../../sandbox/)
- [SandboxOptions](../../sandboxoptions/)
- [WarmDispatchResult](../../warmdispatchresult/)
- [AttachOptions](../../attachoptions/)
- [AttachResult](../../attachresult/)
- [Command](../../command/)
- [CommandResult](../../commandresult/)
- [LifecycleHooks](../../lifecyclehooks/)
- [SandboxDiagnosticReport](../../sandboxdiagnosticreport/)
