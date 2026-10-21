---
title: "TaskInputsOptions"
description: "TaskInputsOptions — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

| Name          | Type                                                                                        | Presence | Meaning                                                                                                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cache`       | `TaskCacheOptions \| undefined`                                                             | Optional | Result cache: a hit restores the stored lossless JSON value with no attempt, usage or side effects. On a miss, a result that is not lossless JSON fails the task. Rejected on gates, interactions and dispatch-result tasks. |
| `retry`       | `Retry \| undefined`                                                                        | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                                                                                 |
| `gate`        | `WorkflowGate \| undefined`                                                                 | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                                                                                     |
| `key`         | `string`                                                                                    | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                                                                                    |
| `after`       | `readonly Task<unknown>[] \| undefined`                                                     | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                                                                                   |
| `interaction` | `TaskInteraction \| undefined`                                                              | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                                                                                    |
| `condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                      | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.                                                                        |
| `timeoutMs`   | `number \| undefined`                                                                       | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat.                                                                  |
| `inputs`      | `Inputs`                                                                                    | Required | Named task dependencies whose typed outputs are passed to perform as context.inputs. Combined with after without duplicate edges.                                                                                            |
| `perform`     | `(context: TaskContext & { readonly inputs: TaskInputValues<Inputs>; }) => T \| Promise<T>` | Required | Run the task with its named dependency outputs and ordinary task context.                                                                                                                                                    |

## Signature

```ts
export type TaskInputsOptions<
  T,
  Inputs extends Readonly<Record<string, Task>>,
> = Omit<TaskOptions<T>, "perform"> & {
  readonly inputs: Inputs;
  readonly perform: (
    context: TaskContext & {
      readonly inputs: TaskInputValues<Inputs>;
    },
  ) => T | Promise<T>;
};
```

## Related contracts

- [Task](../type-task/)
- [TaskContext](../taskcontext/)
- [TaskInputValues](../support-taskinputvalues/)
- [TaskOptions](../taskoptions/)
