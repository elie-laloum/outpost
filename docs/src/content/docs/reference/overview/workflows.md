---
title: "Workflows — Overview"
description: "Declare typed tasks and their dependencies, run the graph with retries, budgets and caches, and read each task’s outcome."
sidebar:
  label: Overview
  order: 0
---

## Choose a task definition

Each definition returns a task that you list in `defineWorkflow()` and connect with `after`. Nothing runs until `start()`.

| Definition                            | Runs at each attempt                              | Sandbox                                | Output                                        |
| ------------------------------------- | ------------------------------------------------- | -------------------------------------- | --------------------------------------------- |
| `defineTask(options)`                 | Your `perform` callback                           | None, or one your code manages         | The value `perform` returns                   |
| `defineCommandTask(options)`          | A command; a nonzero exit fails the attempt       | Yours, left open                       | `CommandResult`                               |
| `defineAgentTask(options)`            | `sandbox.dispatch()` with options from `request`  | Yours, left open                       | Dispatch result with `resume()` and `fork()`  |
| `defineIsolatedTask(options)`         | `dispatch()` with options from `request`          | Allocated and closed by each attempt   | `DispatchResult` with `resume()` and `fork()` |
| `defineLoopTask(options)`             | `attempt` then `check`, up to `maxRounds` rounds  | None, or one your callbacks manage     | The accepted attempt’s value                  |
| `defineInteractiveAgentTask(options)` | One agent turn, then a question or the final JSON | New per turn; the worktree is retained | `InteractiveAgentResult`                      |

:::caution
A checkpoint stores only lossless JSON outputs. In a checkpointed run, wrap `defineAgentTask()` and `defineIsolatedTask()` in a `defineTask()` that returns JSON.
:::

## How a run ends

`start()` runs one task at a time by default (`concurrency`). It resolves once no task can run, even when tasks failed, and rejects only on invalid options, answers or checkpoint errors.

| Event                                                                               | Task status     | Run status                                                                                    |
| ----------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------- |
| `perform` returns, or its `cache` hits (zero attempts)                              | `done`          | `done` when every task is `done` or `skipped`                                                 |
| `condition` returns `false`, or a dependency is not done                            | `skipped`       | Unchanged                                                                                     |
| Last `retry` attempt fails (default 1 attempt)                                      | `failed`        | `failed`; other tasks end `cancelled`, or only dependents `skipped` with `stopOnError: false` |
| A `budget` limit is reached                                                         | `cancelled`     | `failed` with `WorkflowBudgetExceeded`                                                        |
| Quota error with `onQuota` past any `maxWaitMs` wait, or a gate awaiting a decision | `paused`        | `paused`; a later `start()` resumes the task                                                  |
| An interactive task asks a question                                                 | `waiting-input` | `waiting-input` until `start({ answers })`                                                    |
| `signal` aborted                                                                    | `cancelled`     | `cancelled`                                                                                   |
| `start({ timeoutMs })` expires                                                      | `cancelled`     | `failed` with an `OutpostError` code `timeout`                                                |

:::note
Retries, loop rounds and replayed checkpoint attempts repeat side effects. Pass `context.idempotencyKey` to services that deduplicate.
:::

## Entry points

Guide: [Tasks and dependencies](../../../guide/task-dependencies/) · [Concurrency, retries and timeouts](../../../guide/concurrency-and-retries/) · [Verification loops](../../../guide/verification-loops/)

- [defineTask](../../definetask/)
- [defineWorkflow](../../defineworkflow/)
- [defineAgentTask](../../defineagenttask/)
- [defineCommandTask](../../definecommandtask/)
- [defineIsolatedTask](../../defineisolatedtask/)
- [defineLoopTask](../../definelooptask/)
- [defineInteractiveAgentTask](../../defineinteractiveagenttask/)
- [repositoryFingerprint](../../repositoryfingerprint/)
- [WorkflowOptions](../../workflowoptions/)
- [WorkflowResult](../../workflowresult/)
- [TaskContext](../../taskcontext/)
- [TaskRecord](../../taskrecord/)
