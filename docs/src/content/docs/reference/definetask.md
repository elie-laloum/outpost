---
title: "defineTask"
description: "defineTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineTask } from "@elie-laloum/outpost/workflows";
```

## Purpose and behavior

Declare a workflow node from its key, after dependencies and perform callback, with optional condition, retry, timeoutMs, cache, gate or interaction. It allocates no sandbox, and nothing runs until Workflow.start(). Throws on a key outside [A-Za-z0-9][A-Za-z0-9._-]*, invalid retry or cache settings, or a cache combined with a gate or interaction. Named inputs add dependency edges and supply inferred values to perform through context.inputs. They combine with after without duplicate edges; the mapping is copied at declaration.

[Complete example and detailed rules](../../guide/task-dependencies/).

## Parameters and properties

### Variant 1 — `TaskInputsOptions<T, Inputs>`

| Name                  | Type                                                                                        | Presence | Meaning                                                                                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `TaskInputsOptions<T, Inputs>`                                                              | Required | Task key, dependencies and perform callback, with optional condition, retry, timeout, cache, gate or interaction.                                                                                                            |
| `options.cache`       | `TaskCacheOptions \| undefined`                                                             | Optional | Result cache: a hit restores the stored lossless JSON value with no attempt, usage or side effects. On a miss, a result that is not lossless JSON fails the task. Rejected on gates, interactions and dispatch-result tasks. |
| `options.retry`       | `Retry \| undefined`                                                                        | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                                                                                 |
| `options.gate`        | `WorkflowGate \| undefined`                                                                 | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                                                                                     |
| `options.key`         | `string`                                                                                    | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                                                                                    |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                                     | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                                                                                   |
| `options.interaction` | `TaskInteraction \| undefined`                                                              | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                                                                                    |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                      | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.                                                                        |
| `options.timeoutMs`   | `number \| undefined`                                                                       | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat.                                                                  |
| `options.inputs`      | `Inputs`                                                                                    | Required | Named task dependencies whose typed outputs are passed to perform as context.inputs. Combined with after without duplicate edges.                                                                                            |
| `options.perform`     | `(context: TaskContext & { readonly inputs: TaskInputValues<Inputs>; }) => T \| Promise<T>` | Required | Run the task with its named dependency outputs and ordinary task context.                                                                                                                                                    |

### Variant 2 — `TaskOptions<T>`

| Name                  | Type                                                                   | Presence | Meaning                                                                                                                                                                                                                      |
| --------------------- | ---------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `TaskOptions<T>`                                                       | Required | Task key, dependencies and perform callback, with optional condition, retry, timeout, cache, gate or interaction.                                                                                                            |
| `options.cache`       | `TaskCacheOptions \| undefined`                                        | Optional | Result cache: a hit restores the stored lossless JSON value with no attempt, usage or side effects. On a miss, a result that is not lossless JSON fails the task. Rejected on gates, interactions and dispatch-result tasks. |
| `options.retry`       | `Retry \| undefined`                                                   | Optional | Retry policy for failed attempts; without it the task runs once. A retried attempt repeats its side effects.                                                                                                                 |
| `options.gate`        | `WorkflowGate \| undefined`                                            | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                                                                                                     |
| `options.key`         | `string`                                                               | Required | Unique key in the workflow, matching [A-Za-z0-9][A-Za-z0-9._-]*. Records, events and checkpoints identify the task by it.                                                                                                    |
| `options.interaction` | `TaskInteraction \| undefined`                                         | Optional | Opt-in durable human-input contract; requires checkpointed scheduling and cannot be combined with a gate.                                                                                                                    |
| `options.perform`     | `(context: TaskContext) => T \| Promise<T>`                            | Required | Runs each attempt and returns the task output; with a checkpoint, the output must be lossless JSON or undefined. Stop work when context.signal aborts.                                                                       |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optional | Evaluated with attempt 0 before the task runs, including when a later start() resumes it; false ends the task as skipped, which skips its dependents.                                                                        |
| `options.timeoutMs`   | `number \| undefined`                                                  | Optional | Deadline in milliseconds for each attempt, a positive integer up to 2147483647. Expiry aborts context.signal and fails the attempt, which retry may repeat.                                                                  |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                | Optional | Tasks that must be done before this one starts, default none; only these can be read with context.value().                                                                                                                   |

## Returns

`Task<T>`

## Signature

```ts
export declare function defineTask<
  T,
  Inputs extends Readonly<Record<string, Task>>,
>(options: TaskInputsOptions<T, Inputs>): Task<T>;

export declare function defineTask<T>(options: TaskOptions<T>): Task<T>;
```

## Related contracts

- [Task](../type-task/)
- [TaskInputsOptions](../support-taskinputsoptions/)
- [TaskOptions](../taskoptions/)
