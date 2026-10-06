---
title: "defineDecisionTask"
description: "defineDecisionTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineDecisionTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Declare a sandbox-free decision task using existing workflow dependencies, retries, deadlines, caches and checkpoints. Each executed attempt computes its state and reports usage synchronously, including valid receipts for rejected truncations.

[Complete example and detailed rules](../../guide/decisions/).

## Parameters and properties

| Name                     | Type                                                                                   | Presence | Meaning                                                                                                                                                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                | `DecisionTaskOptions<Q>`                                                               | Required | Fixed decision configuration and existing workflow controls; state can be computed from dependencies.                                                                                                                        |
| `options.retry`          | `Retry \| undefined`                                                                   | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                                                                                 |
| `options.cache`          | `TaskCacheOptions \| undefined`                                                        | Optional | Result cache: a hit restores the stored lossless JSON value with no attempt, usage or side effects. On a miss, a result that is not lossless JSON fails the task. Rejected on gates, interactions and dispatch-result tasks. |
| `options.key`            | `string`                                                                               | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                                                                                    |
| `options.after`          | `readonly Task<unknown>[] \| undefined`                                                | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                                                                                   |
| `options.condition`      | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                 | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.                                                                        |
| `options.timeoutMs`      | `number \| undefined`                                                                  | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat.                                                                  |
| `options.decision`       | `Decision<Q>`                                                                          | Required | Frozen typed question declaration created with defineDecision.                                                                                                                                                               |
| `options.model`          | `string`                                                                               | Required | Nonempty decision model name, without generation or reasoning settings.                                                                                                                                                      |
| `options.provider`       | `DecisionProvider`                                                                     | Required | Decision provider that performs this evaluation.                                                                                                                                                                             |
| `options.allowTruncated` | `boolean \| undefined`                                                                 | Optional | False by default; true accepts a reported truncation while retaining its flag in the result.                                                                                                                                 |
| `options.state`          | `DecisionState \| ((context: TaskContext) => DecisionState \| Promise<DecisionState>)` | Required | Static lossless JSON state or a synchronous/asynchronous TaskContext callback, resolved on each executed attempt.                                                                                                            |

## Returns

`Task<DecisionResult<Q>>`

## Signature

```ts
export declare function defineDecisionTask<const Q extends DecisionQuestions>(
  options: DecisionTaskOptions<Q>,
): Task<DecisionResult<Q>>;
```

## Related contracts

- [DecisionQuestions](../decisionquestions/)
- [DecisionResult](../decisionresult/)
- [DecisionTaskOptions](../decisiontaskoptions/)
- [Task](../type-task/)
