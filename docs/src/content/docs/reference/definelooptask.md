---
title: "defineLoopTask"
description: "defineLoopTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineLoopTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Declare a task that runs attempt then check for at most maxRounds rounds, passing each rejected check's feedback to the next attempt. Each round consumes one workflow attempt and, with a checkpoint, saves its phase. The output is the accepted value; exhaustion fails the task with LoopTaskExhausted and a callback exception fails it at once.

[Complete example and detailed rules](../../guide/verification-loops/).

## Parameters and properties

| Name                | Type                                                                                   | Presence | Meaning                                                                                                                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `LoopTaskOptions<T>`                                                                   | Required | Task identity, dependencies, bounded attempt callback and acceptance check.                                                                                                                                                  |
| `options.maxRounds` | `number`                                                                               | Required | Positive safe integer limiting logical rounds across resumes. Replaying an interrupted phase uses its existing round but consumes another workflow attempt.                                                                  |
| `options.attempt`   | `(context: LoopTaskContext, feedback: string \| undefined) => T \| Promise<T>`         | Required | Produce the candidate output from the phase context and previous rejected check feedback; feedback is undefined in round one. Persisted outputs must be lossless JSON or undefined.                                          |
| `options.check`     | `(context: LoopTaskContext, result: T) => LoopCheckResult \| Promise<LoopCheckResult>` | Required | Accept the candidate with done: true or request another round with done: false and text feedback. May invoke a reviewer agent; report its usage through the context. Exceptions fail the task.                               |
| `options.key`       | `string`                                                                               | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                                                                                    |
| `options.cache`     | `TaskCacheOptions \| undefined`                                                        | Optional | Result cache: a hit restores the stored lossless JSON value with no attempt, usage or side effects. On a miss, a result that is not lossless JSON fails the task. Rejected on gates, interactions and dispatch-result tasks. |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                                | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                                                                                   |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                 | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.                                                                        |
| `options.timeoutMs` | `number \| undefined`                                                                  | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat.                                                                  |

## Returns

`Task<T>`

## Signature

```ts
export declare function defineLoopTask<T>(options: LoopTaskOptions<T>): Task<T>;
```

## Related contracts

- [LoopTaskOptions](../looptaskoptions/)
- [Task](../type-task/)
