---
title: "defineIsolatedTask"
description: "defineIsolatedTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineIsolatedTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Declare a task that runs dispatch() at each attempt with the repository, provider, agent and options returned by request; each attempt allocates and closes its own sandbox. The output is the full DispatchResult with its resume() and fork() methods, so a checkpointed run must wrap the task in a defineTask() that returns JSON. cache is rejected.

[Complete example and detailed rules](../../guide/task-dependencies/).

## Parameters and properties

| Name                  | Type                                                                                  | Presence | Meaning                                                                                                                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`             | `Omit<TaskOptions<DispatchResult<T>>, "cache" \| "perform"> & IsolatedTaskOptions<T>` | Required | Task scheduling settings and request factory selecting a separate repository and sandbox for each attempt.                                                                                                                                                   |
| `options.retry`       | `Retry \| undefined`                                                                  | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                                                                                                                 |
| `options.gate`        | `WorkflowGate \| undefined`                                                           | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                                                                                                                     |
| `options.key`         | `string`                                                                              | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                                                                                                                    |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                               | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                                                                                                                   |
| `options.interaction` | `TaskInteraction \| undefined`                                                        | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                                                                                                                    |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.                                                                                                        |
| `options.timeoutMs`   | `number \| undefined`                                                                 | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat.                                                                                                  |
| `options.request`     | `(context: TaskContext) => IsolatedTaskRequest<T> \| Promise<IsolatedTaskRequest<T>>` | Required | Build the repository, sandbox provider, agent and dispatch options for each attempt; may be async.                                                                                                                                                           |
| `options.quotaResume` | `QuotaResumePolicy \| undefined`                                                      | Optional | After a quota pause, continue the captured conversation in the new dispatch (continue, default) or start a new one (restart). Automatically integrated workspaces then start from the interrupted branch; uncommitted changes stay in its retained worktree. |

## Returns

`Task<DispatchResult<T>>`

## Signature

```ts
export declare function defineIsolatedTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform" | "cache"> &
    IsolatedTaskOptions<T>,
): Task<DispatchResult<T>>;
```

## Related contracts

- [DispatchResult](../dispatchresult/)
- [IsolatedTaskOptions](../support-isolatedtaskoptions/)
- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
