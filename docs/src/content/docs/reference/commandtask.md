---
title: "commandTask"
description: "commandTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { commandTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define a workflow node that runs a command in an existing caller-owned sandbox. A command factory can read dependency values. A nonzero process status fails the task, allowing the workflow retry policy to apply; the sandbox remains caller-owned.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name                | Type                                                                   | Presence | Meaning                                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `Omit<TaskOptions<CommandResult>, "perform"> & CommandTaskOptions`     | Required | Task scheduling settings, existing sandbox and command or command factory.                                                               |
| `options.retry`     | `Retry \| undefined`                                                   | Optional | Explicit retry policy; repeated effects require care.                                                                                    |
| `options.gate`      | `WorkflowGate \| undefined`                                            | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                 |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                | Optional | Declared task dependencies whose values may be read.                                                                                     |
| `options.key`       | `string`                                                               | Required | Stable task key identifying the node within its workflow graph.                                                                          |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optional | Predicate evaluated before the first task attempt.                                                                                       |
| `options.timeoutMs` | `number \| undefined`                                                  | Optional | Positive integer time limit in milliseconds for each task attempt, up to 2147483647; cancellation is cooperative through context.signal. |
| `options.sandbox`   | `Sandbox`                                                              | Required | Existing caller-owned sandbox reused by the task; the task does not close it.                                                            |
| `options.command`   | `Command \| ((context: TaskContext) => Command)`                       | Required | Command to run, or factory that builds it from task dependency values.                                                                   |

## Returns

`Task<CommandResult>`

## Signature

```ts
export declare function commandTask(
  options: Omit<TaskOptions<CommandResult>, "perform"> & CommandTaskOptions,
): Task<CommandResult>;
```

## Related contracts

- [CommandResult](../commandresult/)
- [CommandTaskOptions](../support-commandtaskoptions/)
- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
