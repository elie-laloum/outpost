---
title: "defineQueuedTask"
description: "defineQueuedTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineQueuedTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define a workflow task that enqueues a job for handler, polls it until it settles and returns decode(result.value), adding the job’s usage to the run. The job ID comes from executionId and the task key, so a resumed run waits on the same job; a failed or cancelled job fails the task, with code quota when the handler hit a usage limit. Cancelling the workflow cancels the job.

[Complete example and detailed rules](../../guide/job-queues/).

## Parameters and properties

| Name                  | Type                                                                   | Presence | Meaning                                                                                                                                                                                                                      |
| --------------------- | ---------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `QueuedTaskOptions<T>`                                                 | Required | Task definition (key, after, retry and the other task options except perform), plus the queue, handler, input builder, decoder, deadline and poll interval.                                                                  |
| `options.retry`       | `Retry \| undefined`                                                   | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                                                                                 |
| `options.cache`       | `TaskCacheOptions \| undefined`                                        | Optional | Result cache: a hit restores the stored lossless JSON value with no attempt, usage or side effects. On a miss, a result that is not lossless JSON fails the task. Rejected on gates, interactions and dispatch-result tasks. |
| `options.gate`        | `WorkflowGate \| undefined`                                            | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                                                                                     |
| `options.key`         | `string`                                                               | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                                                                                    |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                                                                                   |
| `options.interaction` | `TaskInteraction \| undefined`                                         | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                                                                                    |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.                                                                        |
| `options.timeoutMs`   | `number \| undefined`                                                  | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat.                                                                  |
| `options.queue`       | `TaskQueue`                                                            | Required | Queue in which the task enqueues its job and polls it.                                                                                                                                                                       |
| `options.handler`     | `string`                                                               | Required | Name of the worker handler that runs the job, 1 to 512 characters.                                                                                                                                                           |
| `options.input`       | `(context: TaskContext) => WorkflowJson`                               | Required | Builds the job’s JSON input from the task context, such as dependency values. Called on each attempt: a different value under the same job ID is rejected.                                                                   |
| `options.decode`      | `(value: WorkflowJson) => T`                                           | Required | Converts the job’s JSON value into the task’s result; throw to fail the task.                                                                                                                                                |
| `options.deadline`    | `number \| undefined`                                                  | Optional | Job deadline in epoch milliseconds; the job becomes cancelled once it passes.                                                                                                                                                |
| `options.pollMs`      | `number \| undefined`                                                  | Optional | Interval between job reads in milliseconds, default 250; must be positive.                                                                                                                                                   |

## Returns

`Task<T>`

## Signature

```ts
export declare function defineQueuedTask<T>(
  options: QueuedTaskOptions<T>,
): Task<T>;
```

## Related contracts

- [QueuedTaskOptions](../queuedtaskoptions/)
- [Task](../type-task/)
