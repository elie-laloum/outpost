---
title: "defineAgentTask"
description: "defineAgentTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineAgentTask } from "@elie-laloum/outpost/workflows";
```

## Purpose and behavior

Declare a task that runs sandbox.dispatch() in a borrowed sandbox; request builds dispatch options at each attempt. By default it returns the full dispatch result. select optionally projects the result after usage accounting and may be asynchronous; return lossless JSON for checkpoints. The sandbox remains caller-owned and cache stays rejected, including with select. Selector failures follow the task's configured retry policy.

[Complete example and detailed rules](../../guide/task-dependencies/).

## Parameters and properties

### Variant 1 — `Omit<TaskOptions<Output>, "cache" | "perform"> & FileAgentTaskOptions<T> & TaskResultSelection<FileDispatchResult<T>, Output>`

| Name                  | Type                                                                                                                             | Presence | Meaning                                                                                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `Omit<TaskOptions<Output>, "cache" \| "perform"> & FileAgentTaskOptions<T> & TaskResultSelection<FileDispatchResult<T>, Output>` | Required | Task scheduling settings, existing sandbox and dispatch-request factory.                                                                                                                      |
| `options.retry`       | `Retry \| undefined`                                                                                                             | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                                                  |
| `options.gate`        | `WorkflowGate \| undefined`                                                                                                      | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                                                      |
| `options.key`         | `string`                                                                                                                         | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                                                     |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                                                                          | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                                                    |
| `options.interaction` | `TaskInteraction \| undefined`                                                                                                   | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                                                     |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                                                           | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.                                         |
| `options.timeoutMs`   | `number \| undefined`                                                                                                            | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat.                                   |
| `options.quotaResume` | `QuotaResumePolicy \| undefined`                                                                                                 | Optional | Opt-in native conversation continuation after quota pause, without consuming a task retry.                                                                                                    |
| `options.sandbox`     | `FileSandbox`                                                                                                                    | Required | Sandbox bound to this workspace; closing it leaves a borrowed workspace open.                                                                                                                 |
| `options.request`     | `(context: TaskContext) => DispatchOptions<T>`                                                                                   | Required | Build the declared command or agent request from the current task context before acquisition.                                                                                                 |
| `options.select`      | `(result: FileDispatchResult<T>) => Output \| Promise<Output>`                                                                   | Required | Project the completed dispatch result into the task output after usage accounting. Return lossless JSON for checkpointed workflows. This does not enable caching or change sandbox ownership. |

### Variant 2 — `Omit<TaskOptions<Output>, "cache" | "perform"> & AgentTaskOptions<T> & TaskResultSelection<DispatchResult<T>, Output>`

| Name                  | Type                                                                                                                     | Presence | Meaning                                                                                                                                                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `Omit<TaskOptions<Output>, "cache" \| "perform"> & AgentTaskOptions<T> & TaskResultSelection<DispatchResult<T>, Output>` | Required | Task scheduling settings, existing sandbox and dispatch-request factory.                                                                                                                                                                                                                       |
| `options.retry`       | `Retry \| undefined`                                                                                                     | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                                                                                                                                                   |
| `options.gate`        | `WorkflowGate \| undefined`                                                                                              | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                                                                                                                                                       |
| `options.key`         | `string`                                                                                                                 | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                                                                                                                                                      |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                                                                  | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                                                                                                                                                     |
| `options.interaction` | `TaskInteraction \| undefined`                                                                                           | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                                                                                                                                                      |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                                                   | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.                                                                                                                                          |
| `options.timeoutMs`   | `number \| undefined`                                                                                                    | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat.                                                                                                                                    |
| `options.sandbox`     | `Sandbox`                                                                                                                | Required | Existing caller-owned sandbox reused by the task; the task does not close it.                                                                                                                                                                                                                  |
| `options.request`     | `(context: TaskContext) => DispatchOptions<T>`                                                                           | Required | Build dispatch options from task dependencies for the existing sandbox.                                                                                                                                                                                                                        |
| `options.quotaResume` | `QuotaResumePolicy \| undefined`                                                                                         | Optional | After a quota pause, continue the captured conversation with a resume instruction (continue, default) or send the original request again (restart). The original request is sent when the agent cannot resume or is a fallback agent, or when the request sets continuation or several passes. |
| `options.select`      | `(result: DispatchResult<T>) => Output \| Promise<Output>`                                                               | Required | Project the completed dispatch result into the task output after usage accounting. Return lossless JSON for checkpointed workflows. This does not enable caching or change sandbox ownership.                                                                                                  |

### Variant 3 — `Omit<TaskOptions<Output>, "cache" | "perform"> & MixedAgentTaskOptions<T> & TaskResultSelection<DispatchResult<T> | FileDispatchResult<...>, Output>`

| Name                  | Type                                                                                                                                                   | Presence | Meaning                                                                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `Omit<TaskOptions<Output>, "cache" \| "perform"> & MixedAgentTaskOptions<T> & TaskResultSelection<DispatchResult<T> \| FileDispatchResult<T>, Output>` | Required | Task scheduling settings, existing sandbox and dispatch-request factory.                                                                                                                      |
| `options.retry`       | `Retry \| undefined`                                                                                                                                   | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                                                  |
| `options.gate`        | `WorkflowGate \| undefined`                                                                                                                            | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                                                      |
| `options.key`         | `string`                                                                                                                                               | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                                                     |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                                                                                                | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                                                    |
| `options.interaction` | `TaskInteraction \| undefined`                                                                                                                         | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                                                     |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                                                                                 | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.                                         |
| `options.timeoutMs`   | `number \| undefined`                                                                                                                                  | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat.                                   |
| `options.sandbox`     | `FileSandbox \| Sandbox`                                                                                                                               | Required | Sandbox bound to this workspace; closing it leaves a borrowed workspace open.                                                                                                                 |
| `options.request`     | `(context: TaskContext) => DispatchOptions<T>`                                                                                                         | Required | Build the declared command or agent request from the current task context before acquisition.                                                                                                 |
| `options.quotaResume` | `QuotaResumePolicy \| undefined`                                                                                                                       | Optional | Opt-in native conversation continuation after quota pause, without consuming a task retry.                                                                                                    |
| `options.select`      | `(result: DispatchResult<T> \| FileDispatchResult<T>) => Output \| Promise<Output>`                                                                    | Required | Project the completed dispatch result into the task output after usage accounting. Return lossless JSON for checkpointed workflows. This does not enable caching or change sandbox ownership. |

### Variant 4 — `Omit<TaskOptions<FileDispatchResult<T>>, "cache" | "perform"> & FileAgentTaskOptions<T>`

| Name                  | Type                                                                                       | Presence | Meaning                                                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `Omit<TaskOptions<FileDispatchResult<T>>, "cache" \| "perform"> & FileAgentTaskOptions<T>` | Required | Task scheduling settings, existing sandbox and dispatch-request factory.                                                                                    |
| `options.retry`       | `Retry \| undefined`                                                                       | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                |
| `options.gate`        | `WorkflowGate \| undefined`                                                                | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                    |
| `options.key`         | `string`                                                                                   | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                   |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                                    | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                  |
| `options.interaction` | `TaskInteraction \| undefined`                                                             | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                   |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                     | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.       |
| `options.timeoutMs`   | `number \| undefined`                                                                      | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat. |
| `options.quotaResume` | `QuotaResumePolicy \| undefined`                                                           | Optional | Opt-in native conversation continuation after quota pause, without consuming a task retry.                                                                  |
| `options.sandbox`     | `FileSandbox`                                                                              | Required | Sandbox bound to this workspace; closing it leaves a borrowed workspace open.                                                                               |
| `options.request`     | `(context: TaskContext) => DispatchOptions<T>`                                             | Required | Build the declared command or agent request from the current task context before acquisition.                                                               |

### Variant 5 — `Omit<TaskOptions<DispatchResult<T>>, "cache" | "perform"> & AgentTaskOptions<T>`

| Name                  | Type                                                                               | Presence | Meaning                                                                                                                                                                                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `Omit<TaskOptions<DispatchResult<T>>, "cache" \| "perform"> & AgentTaskOptions<T>` | Required | Task scheduling settings, existing sandbox and dispatch-request factory.                                                                                                                                                                                                                       |
| `options.retry`       | `Retry \| undefined`                                                               | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                                                                                                                                                   |
| `options.gate`        | `WorkflowGate \| undefined`                                                        | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                                                                                                                                                       |
| `options.key`         | `string`                                                                           | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                                                                                                                                                      |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                            | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                                                                                                                                                     |
| `options.interaction` | `TaskInteraction \| undefined`                                                     | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                                                                                                                                                      |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`             | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.                                                                                                                                          |
| `options.timeoutMs`   | `number \| undefined`                                                              | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat.                                                                                                                                    |
| `options.sandbox`     | `Sandbox`                                                                          | Required | Existing caller-owned sandbox reused by the task; the task does not close it.                                                                                                                                                                                                                  |
| `options.request`     | `(context: TaskContext) => DispatchOptions<T>`                                     | Required | Build dispatch options from task dependencies for the existing sandbox.                                                                                                                                                                                                                        |
| `options.quotaResume` | `QuotaResumePolicy \| undefined`                                                   | Optional | After a quota pause, continue the captured conversation with a resume instruction (continue, default) or send the original request again (restart). The original request is sent when the agent cannot resume or is a fallback agent, or when the request sets continuation or several passes. |

### Variant 6 — `Omit<TaskOptions<DispatchResult<T> | FileDispatchResult<T>>, "cache" | "perform"> & MixedAgentTaskOptions<T>`

| Name                  | Type                                                                                                             | Presence | Meaning                                                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `Omit<TaskOptions<DispatchResult<T> \| FileDispatchResult<T>>, "cache" \| "perform"> & MixedAgentTaskOptions<T>` | Required | Task scheduling settings, existing sandbox and dispatch-request factory.                                                                                    |
| `options.retry`       | `Retry \| undefined`                                                                                             | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                |
| `options.gate`        | `WorkflowGate \| undefined`                                                                                      | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                    |
| `options.key`         | `string`                                                                                                         | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                   |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                                                          | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                  |
| `options.interaction` | `TaskInteraction \| undefined`                                                                                   | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                   |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                                           | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.       |
| `options.timeoutMs`   | `number \| undefined`                                                                                            | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat. |
| `options.sandbox`     | `FileSandbox \| Sandbox`                                                                                         | Required | Sandbox bound to this workspace; closing it leaves a borrowed workspace open.                                                                               |
| `options.request`     | `(context: TaskContext) => DispatchOptions<T>`                                                                   | Required | Build the declared command or agent request from the current task context before acquisition.                                                               |
| `options.quotaResume` | `QuotaResumePolicy \| undefined`                                                                                 | Optional | Opt-in native conversation continuation after quota pause, without consuming a task retry.                                                                  |

## Returns

`Task<Output>` · `Task<FileDispatchResult<T>>` · `Task<DispatchResult<T>>` · `Task<DispatchResult<T> | FileDispatchResult<T>>`

## Signature

```ts
export declare function defineAgentTask<T, Output>(
  options: Omit<TaskOptions<Output>, "perform" | "cache"> &
    FileAgentTaskOptions<T> &
    TaskResultSelection<FileDispatchResult<T>, Output>,
): Task<Output>;

export declare function defineAgentTask<T, Output>(
  options: Omit<TaskOptions<Output>, "perform" | "cache"> &
    AgentTaskOptions<T> &
    TaskResultSelection<DispatchResult<T>, Output>,
): Task<Output>;

export declare function defineAgentTask<T, Output>(
  options: Omit<TaskOptions<Output>, "perform" | "cache"> &
    MixedAgentTaskOptions<T> &
    TaskResultSelection<DispatchResult<T> | FileDispatchResult<T>, Output>,
): Task<Output>;

export declare function defineAgentTask<T>(
  options: Omit<TaskOptions<FileDispatchResult<T>>, "perform" | "cache"> &
    FileAgentTaskOptions<T>,
): Task<FileDispatchResult<T>>;

export declare function defineAgentTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform" | "cache"> &
    AgentTaskOptions<T>,
): Task<DispatchResult<T>>;

export declare function defineAgentTask<T>(
  options: Omit<
    TaskOptions<DispatchResult<T> | FileDispatchResult<T>>,
    "perform" | "cache"
  > &
    MixedAgentTaskOptions<T>,
): Task<DispatchResult<T> | FileDispatchResult<T>>;
```

## Related contracts

- [AgentTaskOptions](../support-agenttaskoptions/)
- [DispatchResult](../dispatchresult/)
- [FileAgentTaskOptions](../fileagenttaskoptions/)
- [FileDispatchResult](../filedispatchresult/)
- [MixedAgentTaskOptions](../mixedagenttaskoptions/)
- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
- [TaskResultSelection](../support-taskresultselection/)
