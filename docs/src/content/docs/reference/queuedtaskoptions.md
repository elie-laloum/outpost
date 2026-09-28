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

| Name        | Type                                                                   | Presence | Meaning                                                                                                                                  |
| ----------- | ---------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `retry`     | `Retry \| undefined`                                                   | Optional | Explicit retry policy; repeated effects require care.                                                                                    |
| `gate`      | `WorkflowGate \| undefined`                                            | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                 |
| `after`     | `readonly Task<unknown>[] \| undefined`                                | Optional | Declared task dependencies whose values may be read.                                                                                     |
| `key`       | `string`                                                               | Required | Stable task key identifying the node within its workflow graph.                                                                          |
| `condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optional | Predicate evaluated before the first task attempt.                                                                                       |
| `timeoutMs` | `number \| undefined`                                                  | Optional | Positive integer time limit in milliseconds for each task attempt, up to 2147483647; cancellation is cooperative through context.signal. |
| `queue`     | `TaskQueue`                                                            | Required | Task queue used to enqueue, claim and persist job state.                                                                                 |
| `handler`   | `string`                                                               | Required | Registered worker handler name that will execute this JSON job.                                                                          |
| `input`     | `(context: TaskContext) => WorkflowJson`                               | Required | Build the queued job’s JSON input from task dependencies.                                                                                |
| `decode`    | `(value: WorkflowJson) => T`                                           | Required | Validate and decode the worker’s JSON result into this task’s output type.                                                               |
| `deadline`  | `number \| undefined`                                                  | Optional | Absolute job deadline as a Unix timestamp in milliseconds.                                                                               |
| `pollMs`    | `number \| undefined`                                                  | Optional | Interval in milliseconds between queue polls.                                                                                            |

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
