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

| Name                  | Type                                                                               | Presence | Meaning                                                                                                                                                                                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `Omit<TaskOptions<DispatchResult<T>>, "cache" \| "perform"> & AgentTaskOptions<T>` | Required | Task scheduling settings, existing sandbox and dispatch-request factory.                                                                                                                                                                                                                       |
| `options.retry`       | `Retry \| undefined`                                                               | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                                                                                                                                                   |
| `options.key`         | `string`                                                                           | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                                                                                                                                                      |
| `options.gate`        | `WorkflowGate \| undefined`                                                        | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                                                                                                                                                       |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                            | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                                                                                                                                                     |
| `options.interaction` | `TaskInteraction \| undefined`                                                     | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                                                                                                                                                      |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`             | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.                                                                                                                                          |
| `options.timeoutMs`   | `number \| undefined`                                                              | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat.                                                                                                                                    |
| `options.sandbox`     | `Sandbox`                                                                          | Required | Existing caller-owned sandbox reused by the task; the task does not close it.                                                                                                                                                                                                                  |
| `options.request`     | `(context: TaskContext) => DispatchOptions<T>`                                     | Required | Build dispatch options from task dependencies for the existing sandbox.                                                                                                                                                                                                                        |
| `options.quotaResume` | `QuotaResumePolicy \| undefined`                                                   | Optional | After a quota pause, continue the captured conversation with a resume instruction (continue, default) or send the original request again (restart). The original request is sent when the agent cannot resume or is a fallback agent, or when the request sets continuation or several passes. |

## Returns

`Task<DispatchResult<T>>`

## Signature

```ts
export declare function defineAgentTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform" | "cache"> &
    AgentTaskOptions<T>,
): Task<DispatchResult<T>>;
```

## Related contracts

- [AgentTaskOptions](../support-agenttaskoptions/)
- [DispatchResult](../dispatchresult/)
- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
