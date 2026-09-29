---
title: "QueuedTaskOptions"
description: "QueuedTaskOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { QueuedTaskOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                                                   | Presence | Meaning                                                                                                                                                                                                                      |
| ------------- | ---------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retry`       | `Retry \| undefined`                                                   | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                                                                                 |
| `key`         | `string`                                                               | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                                                                                    |
| `cache`       | `TaskCacheOptions \| undefined`                                        | Optional | Result cache: a hit restores the stored lossless JSON value with no attempt, usage or side effects. On a miss, a result that is not lossless JSON fails the task. Rejected on gates, interactions and dispatch-result tasks. |
| `gate`        | `WorkflowGate \| undefined`                                            | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                                                                                     |
| `after`       | `readonly Task<unknown>[] \| undefined`                                | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                                                                                   |
| `interaction` | `TaskInteraction \| undefined`                                         | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                                                                                    |
| `condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.                                                                        |
| `timeoutMs`   | `number \| undefined`                                                  | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat.                                                                  |
| `queue`       | `TaskQueue`                                                            | Required | Queue in which the task enqueues its job and polls it.                                                                                                                                                                       |
| `handler`     | `string`                                                               | Required | Name of the worker handler that runs the job, 1 to 512 characters.                                                                                                                                                           |
| `input`       | `(context: TaskContext) => WorkflowJson`                               | Required | Builds the job’s JSON input from the task context, such as dependency values. Called on each attempt: a different value under the same job ID is rejected.                                                                   |
| `decode`      | `(value: WorkflowJson) => T`                                           | Required | Converts the job’s JSON value into the task’s result; throw to fail the task.                                                                                                                                                |
| `deadline`    | `number \| undefined`                                                  | Optional | Job deadline in epoch milliseconds; the job becomes cancelled once it passes.                                                                                                                                                |
| `pollMs`      | `number \| undefined`                                                  | Optional | Interval between job reads in milliseconds, default 250; must be positive.                                                                                                                                                   |

## Signature

```ts
export type QueuedTaskOptions<T> = Omit<TaskOptions<T>, "perform"> & {
  readonly queue: TaskQueue;
  readonly handler: string;
  readonly input: (context: TaskContext) => WorkflowJson;
  readonly decode: (value: WorkflowJson) => T;
  readonly deadline?: number;
  readonly pollMs?: number;
};
```

## Related contracts

- [TaskContext](../taskcontext/)
- [TaskOptions](../taskoptions/)
- [TaskQueue](../taskqueue/)
- [WorkflowJson](../workflowjson/)
