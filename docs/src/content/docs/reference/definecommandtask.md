---
title: "defineCommandTask"
description: "defineCommandTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineCommandTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Declare a task that runs a command in a sandbox you opened and keep open; command may be a factory reading dependency values. A nonzero exit status fails the attempt with OutpostError code process, so retry applies. The output is the CommandResult.

[Complete example and detailed rules](../../guide/task-dependencies/).

## Parameters and properties

| Name                  | Type                                                                   | Presence | Meaning                                                                                                                                                                                                                      |
| --------------------- | ---------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `Omit<TaskOptions<CommandResult>, "perform"> & CommandTaskOptions`     | Required | Task scheduling settings, existing sandbox and command or command factory.                                                                                                                                                   |
| `options.retry`       | `Retry \| undefined`                                                   | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                                                                                 |
| `options.cache`       | `TaskCacheOptions \| undefined`                                        | Optional | Result cache: a hit restores the stored lossless JSON value with no attempt, usage or side effects. On a miss, a result that is not lossless JSON fails the task. Rejected on gates, interactions and dispatch-result tasks. |
| `options.gate`        | `WorkflowGate \| undefined`                                            | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                                                                                     |
| `options.key`         | `string`                                                               | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                                                                                    |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                                                                                   |
| `options.interaction` | `TaskInteraction \| undefined`                                         | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                                                                                    |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.                                                                        |
| `options.timeoutMs`   | `number \| undefined`                                                  | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat.                                                                  |
| `options.sandbox`     | `Sandbox`                                                              | Required | Existing caller-owned sandbox reused by the task; the task does not close it.                                                                                                                                                |
| `options.command`     | `Command \| ((context: TaskContext) => Command)`                       | Required | Command to run, or factory that builds it from task dependency values.                                                                                                                                                       |

## Returns

`Task<CommandResult>`

## Signature

```ts
export declare function defineCommandTask(
  options: Omit<TaskOptions<CommandResult>, "perform"> & CommandTaskOptions,
): Task<CommandResult>;
```

## Related contracts

- [CommandResult](../commandresult/)
- [CommandTaskOptions](../support-commandtaskoptions/)
- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
