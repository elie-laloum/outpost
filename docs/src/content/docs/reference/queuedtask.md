---
title: "queuedTask"
description: "queuedTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { queuedTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define a workflow node that enqueues a durable job and polls its completion. Derive the job identity from execution and task identity, decode the JSON result and account for returned usage. A registered worker performs the remote handler.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name                | Type                                                                   | Presence | Meaning                                                                                                  |
| ------------------- | ---------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `options`           | `QueuedTaskOptions<T>`                                                 | Required | Task scheduling, queue handler, input factory, result decoder and polling settings.                      |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                | Optional | Declared task dependencies whose values may be read.                                                     |
| `options.key`       | `string`                                                               | Required | Stable task key identifying the node within its workflow graph.                                          |
| `options.gate`      | `WorkflowGate \| undefined`                                            | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision. |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optional | Predicate evaluated before the first task attempt.                                                       |
| `options.retry`     | `Retry \| undefined`                                                   | Optional | Explicit retry policy; repeated effects require care.                                                    |
| `options.timeoutMs` | `number \| undefined`                                                  | Optional | Time limit in milliseconds for each task attempt; cancellation is cooperative through context.signal.    |
| `options.queue`     | `TaskQueue`                                                            | Required | Task queue used to enqueue, claim and persist job state.                                                 |
| `options.handler`   | `string`                                                               | Required | Registered worker handler name that will execute this JSON job.                                          |
| `options.input`     | `(context: TaskContext) => WorkflowJson`                               | Required | Build the queued job’s JSON input from task dependencies.                                                |
| `options.decode`    | `(value: WorkflowJson) => T`                                           | Required | Validate and decode the worker’s JSON result into this task’s output type.                               |
| `options.deadline`  | `number \| undefined`                                                  | Optional | Absolute job deadline as a Unix timestamp in milliseconds.                                               |
| `options.pollMs`    | `number \| undefined`                                                  | Optional | Interval in milliseconds between queue polls.                                                            |

## Returns

`Task<T>`

## Signature

```ts
export declare function queuedTask<T>(options: QueuedTaskOptions<T>): Task<T>;
```

## Related contracts

- [QueuedTaskOptions](../queuedtaskoptions/)
- [Task](../type-task/)
