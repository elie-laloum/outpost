---
title: "defineAgentTask"
description: "defineAgentTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineAgentTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Declare a task that runs sandbox.dispatch() in a sandbox you opened and keep open; request builds the dispatch options at each attempt. The output is the dispatch result with its resume() and fork() methods, so a checkpointed run must wrap the task in a defineTask() that returns JSON. Usage joins the workflow budget; cache is rejected.

[Complete example and detailed rules](../../guide/task-dependencies/).

## Parameters and properties

| Name                  | Type                                                                                                                                                                                                                                                                                             | Presence | Meaning                                                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `Omit<TaskOptions<FileDispatchResult<T>>, "cache" \| "perform"> & FileAgentTaskOptions<T> \| Omit<TaskOptions<DispatchResult<T>>, "cache" \| "perform"> & AgentTaskOptions<T> \| Omit<TaskOptions<DispatchResult<T> \| FileDispatchResult<T>>, "cache" \| "perform"> & MixedAgentTaskOptions<T>` | Required | Task scheduling settings, existing sandbox and dispatch-request factory.                                                                                    |
| `options.retry`       | `Retry \| undefined`                                                                                                                                                                                                                                                                             | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                |
| `options.gate`        | `WorkflowGate \| undefined`                                                                                                                                                                                                                                                                      | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                    |
| `options.key`         | `string`                                                                                                                                                                                                                                                                                         | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                   |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                                                                                                                                                                                                                                          | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                  |
| `options.interaction` | `TaskInteraction \| undefined`                                                                                                                                                                                                                                                                   | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                   |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                                                                                                                                                                                                                           | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.       |
| `options.timeoutMs`   | `number \| undefined`                                                                                                                                                                                                                                                                            | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat. |
| `options.quotaResume` | `QuotaResumePolicy \| undefined`                                                                                                                                                                                                                                                                 | Optional | Opt-in native conversation continuation after quota pause, without consuming a task retry.                                                                  |
| `options.sandbox`     | `FileSandbox \| Sandbox`                                                                                                                                                                                                                                                                         | Required | Sandbox bound to this workspace; closing it leaves a borrowed workspace open.                                                                               |
| `options.request`     | `(context: TaskContext) => DispatchOptions<T>`                                                                                                                                                                                                                                                   | Required | Build the declared command or agent request from the current task context before acquisition.                                                               |

## Returns

`Task<FileDispatchResult<T>>` · `Task<DispatchResult<T>>` · `Task<DispatchResult<T> | FileDispatchResult<T>>`

## Signature

```ts
export declare function defineAgentTask<T>(
  options: Omit<TaskOptions<FileDispatchResult<T>>, "perform" | "cache"> &
    FileAgentTaskOptions<T>,
): Task<FileDispatchResult<T>>;
```

## Related contracts

- [AgentTaskOptions](../support-agenttaskoptions/)
- [DispatchResult](../dispatchresult/)
- [FileAgentTaskOptions](../fileagenttaskoptions/)
- [FileDispatchResult](../filedispatchresult/)
- [MixedAgentTaskOptions](../mixedagenttaskoptions/)
- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
