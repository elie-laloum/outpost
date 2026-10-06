---
title: "LoopTaskOptions"
description: "LoopTaskOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { LoopTaskOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                                                                   | Presence | Meaning                                                                                                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxRounds` | `number`                                                                               | Required | Positive safe integer limiting logical rounds across resumes. Replaying an interrupted phase uses its existing round but consumes another workflow attempt.                                    |
| `attempt`   | `(context: LoopTaskContext, feedback: string \| undefined) => T \| Promise<T>`         | Required | Produce the candidate output from the phase context and previous rejected check feedback; feedback is undefined in round one. Persisted outputs must be lossless JSON or undefined.            |
| `check`     | `(context: LoopTaskContext, result: T) => LoopCheckResult \| Promise<LoopCheckResult>` | Required | Accept the candidate with done: true or request another round with done: false and text feedback. May invoke a reviewer agent; report its usage through the context. Exceptions fail the task. |
| `cache`     | `TaskCacheOptions \| undefined`                                                        | Optional | Opt-in cache for the accepted loop result; a hit skips every round and records no rounds.                                                                                                      |
| `key`       | `string`                                                                               | Required | Stable node key used by dependencies, checkpoints and loop events.                                                                                                                             |
| `after`     | `readonly Task<unknown>[] \| undefined`                                                | Optional | Dependencies that must succeed before the first round; their outputs are available through context.value.                                                                                      |
| `condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                 | Optional | Predicate evaluated before the loop starts or resumes; false skips the task and its dependents.                                                                                                |
| `timeoutMs` | `number \| undefined`                                                                  | Optional | Cooperative deadline for one round execution, including attempt and check; renewed when an interrupted phase resumes.                                                                          |

## Signature

```ts
export interface LoopTaskOptions<T> extends Pick<
  TaskOptions<T>,
  "key" | "after" | "condition" | "timeoutMs" | "cache"
> {
  readonly maxRounds: number;
  readonly attempt: (
    context: LoopTaskContext,
    feedback: string | undefined,
  ) => T | Promise<T>;
  readonly check: (
    context: LoopTaskContext,
    result: T,
  ) => LoopCheckResult | Promise<LoopCheckResult>;
}
```

## Related contracts

- [LoopCheckResult](../loopcheckresult/)
- [LoopTaskContext](../looptaskcontext/)
- [TaskOptions](../taskoptions/)
