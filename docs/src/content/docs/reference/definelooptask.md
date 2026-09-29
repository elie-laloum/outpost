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

Define a bounded attempt/check workflow node. Failed checks supply feedback to the next round; callback exceptions fail the task. The workflow persists phase progress, admits every round execution against its cumulative budget and returns the accepted attempt output. It owns neither the sandbox nor agent conversations.

[Complete example and detailed rules](../../guide/verification-loops/).

## Parameters and properties

| Name                | Type                                                                                   | Presence | Meaning                                                                                                                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `LoopTaskOptions<T>`                                                                   | Required | Task identity, dependencies, bounded attempt callback and acceptance check.                                                                                                                    |
| `options.maxRounds` | `number`                                                                               | Required | Positive safe integer limiting logical rounds across resumes. Replaying an interrupted phase uses its existing round but consumes another workflow attempt.                                    |
| `options.attempt`   | `(context: LoopTaskContext, feedback: string \| undefined) => T \| Promise<T>`         | Required | Produce the candidate output from the phase context and previous rejected check feedback; feedback is undefined in round one. Persisted outputs must be lossless JSON or undefined.            |
| `options.check`     | `(context: LoopTaskContext, result: T) => LoopCheckResult \| Promise<LoopCheckResult>` | Required | Accept the candidate with done: true or request another round with done: false and text feedback. May invoke a reviewer agent; report its usage through the context. Exceptions fail the task. |
| `options.key`       | `string`                                                                               | Required | Stable task key identifying the node within its workflow graph.                                                                                                                                |
| `options.cache`     | `TaskCacheOptions \| undefined`                                                        | Optional | Opt-in result cache: a hit restores the stored lossless JSON value without an attempt, usage or side effects. Rejected on gates, interactions and dispatch-result tasks.                       |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                                | Optional | Declared task dependencies whose values may be read.                                                                                                                                           |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                 | Optional | Predicate evaluated before the first task attempt.                                                                                                                                             |
| `options.timeoutMs` | `number \| undefined`                                                                  | Optional | Positive integer time limit in milliseconds for each task attempt, up to 2147483647; cancellation is cooperative through context.signal.                                                       |

## Returns

`Task<T>`

## Signature

```ts
export declare function defineLoopTask<T>(options: LoopTaskOptions<T>): Task<T>;
```

## Related contracts

- [LoopTaskOptions](../looptaskoptions/)
- [Task](../type-task/)
