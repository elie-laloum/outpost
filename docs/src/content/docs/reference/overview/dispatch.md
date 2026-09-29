---
title: "Dispatch — Overview"
description: "Give an agent a brief, let it work in a sandbox, and get back its text, typed value, usage, commits and conversation."
sidebar:
  label: Overview
  order: 0
---

## Choose a call

| Call                                        | Sandbox                                          | Use it for                                   |
| ------------------------------------------- | ------------------------------------------------ | -------------------------------------------- |
| `dispatch(options)`                         | Allocated for the call, closed afterwards        | One task in a fresh environment              |
| `sandbox.dispatch(options)`                 | Your open sandbox, left open                     | Several tasks sharing installed state        |
| `result.resume(options)` / `result.fork(…)` | New sandbox (cold result) or the same one (warm) | Continue or branch the captured conversation |
| `createSteering()` passed as `steering`     | Unchanged                                        | Send instructions while the agent runs       |

A cold `dispatch` integrates the branch and closes the sandbox on success. On failure it closes the sandbox, keeps the worktree, and records the branch and directory in the error’s `recovery`.

## How a dispatch ends

| Event                                     | Default                   | Outcome                                                         |
| ----------------------------------------- | ------------------------- | --------------------------------------------------------------- |
| Completion marker in the last turn’s text | `<outpost>done</outpost>` | `completed: true`; a still-running agent stops after `settleMs` |
| Typed response parsed and validated       | —                         | `value` is set; invalid answers get correction turns            |
| All `passes` run without a marker         | 1 pass                    | Resolves with `completed: false`                                |
| No agent output for `idleMs`              | 10 minutes                | Rejects with code `timeout`                                     |
| Agent process exceeds `deadlineMs`        | 1 hour                    | Rejects with code `timeout`                                     |
| Agent exits with a nonzero status         | —                         | Rejects with code `process`, or `quota` for a usage limit       |
| `signal` aborted                          | —                         | Rejects with the abort reason                                   |

:::note
A marker, a typed answer or a commit does not prove the work is correct. Enforce checks with a command or a workflow gate.
:::

## Entry points

Guide: [Your first task](../../../guide/first-request/) · [Steering a running agent](../../../guide/steering/)

- [dispatch](../../dispatch/)
- [DispatchOptions](../../dispatchoptions/)
- [DispatchResult](../../dispatchresult/)
- [WarmDispatchResult](../../warmdispatchresult/)
- [Execution](../../execution/)
- [ContinuationOptions](../../continuationoptions/)
- [createSteering](../../createsteering/)
- [Steering](../../steering/)
