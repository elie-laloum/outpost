---
title: "DecisionTaskOptions"
description: "DecisionTaskOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { DecisionTaskOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                                                                                   | Presence | Meaning                                                                                                                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retry`          | `Retry \| undefined`                                                                   | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                                                                                 |
| `cache`          | `TaskCacheOptions \| undefined`                                                        | Optional | Result cache: a hit restores the stored lossless JSON value with no attempt, usage or side effects. On a miss, a result that is not lossless JSON fails the task. Rejected on gates, interactions and dispatch-result tasks. |
| `key`            | `string`                                                                               | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                                                                                    |
| `after`          | `readonly Task<unknown>[] \| undefined`                                                | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                                                                                   |
| `condition`      | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                 | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.                                                                        |
| `timeoutMs`      | `number \| undefined`                                                                  | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat.                                                                  |
| `decision`       | `Decision<Q>`                                                                          | Required | Frozen typed question declaration created with defineDecision.                                                                                                                                                               |
| `model`          | `string`                                                                               | Required | Nonempty decision model name, without generation or reasoning settings.                                                                                                                                                      |
| `provider`       | `DecisionProvider`                                                                     | Required | Decision provider that performs this evaluation.                                                                                                                                                                             |
| `allowTruncated` | `boolean \| undefined`                                                                 | Optional | False by default; true accepts a reported truncation while retaining its flag in the result.                                                                                                                                 |
| `state`          | `DecisionState \| ((context: TaskContext) => DecisionState \| Promise<DecisionState>)` | Required | Static lossless JSON state or a synchronous/asynchronous TaskContext callback, resolved on each executed attempt.                                                                                                            |

## Signature

```ts
export type DecisionTaskOptions<
  Q extends DecisionQuestions = DecisionQuestions,
> = Omit<TaskOptions<DecisionResult<Q>>, "perform" | "gate" | "interaction"> &
  Omit<DecideOptions<Q>, "state" | "signal" | "observation"> & {
    readonly state:
      | DecisionState
      | ((context: TaskContext) => DecisionState | Promise<DecisionState>);
  };
```

## Related contracts

- [DecideOptions](../decideoptions/)
- [DecisionQuestions](../decisionquestions/)
- [DecisionResult](../decisionresult/)
- [DecisionState](../decisionstate/)
- [TaskContext](../taskcontext/)
- [TaskOptions](../taskoptions/)
