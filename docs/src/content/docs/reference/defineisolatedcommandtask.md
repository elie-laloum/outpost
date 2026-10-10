---
title: "defineIsolatedCommandTask"
description: "defineIsolatedCommandTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineIsolatedCommandTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Declares a command task with its own file workspace and sandbox, without requiring an agent. Borrowed resources remain caller-owned.

[Complete example and detailed rules](../../guide/working-with-files/).

## Parameters and properties

| Name                  | Type                                                                                          | Presence | Meaning                                                                                                                                                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `Omit<TaskOptions<CommandResult>, "perform"> & IsolatedCommandTaskOptions`                    | Required | Declare the task key, dependencies and the command request whose sandbox the task owns.                                                                                                                                      |
| `options.cache`       | `TaskCacheOptions \| undefined`                                                               | Optional | Result cache: a hit restores the stored lossless JSON value with no attempt, usage or side effects. On a miss, a result that is not lossless JSON fails the task. Rejected on gates, interactions and dispatch-result tasks. |
| `options.retry`       | `Retry \| undefined`                                                                          | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                                                                                 |
| `options.gate`        | `WorkflowGate \| undefined`                                                                   | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                                                                                     |
| `options.key`         | `string`                                                                                      | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                                                                                    |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                                       | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                                                                                   |
| `options.interaction` | `TaskInteraction \| undefined`                                                                | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                                                                                    |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                        | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.                                                                        |
| `options.timeoutMs`   | `number \| undefined`                                                                         | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat.                                                                  |
| `options.request`     | `(context: TaskContext) => FileIsolatedCommandRequest \| Promise<FileIsolatedCommandRequest>` | Required | Build the declared command or agent request from the current task context before acquisition.                                                                                                                                |

## Returns

`Task<CommandResult>`

## Signature

```ts
export declare function defineIsolatedCommandTask(
  options: Omit<TaskOptions<CommandResult>, "perform"> &
    IsolatedCommandTaskOptions,
): Task<CommandResult>;
```

## Related contracts

- [CommandResult](../commandresult/)
- [IsolatedCommandTaskOptions](../isolatedcommandtaskoptions/)
- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
