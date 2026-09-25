---
title: "task"
description: "task — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { task } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define and freeze a workflow node whose perform callback runs when its dependencies succeed. Creating the node does not execute it or allocate a sandbox. Use context.value to read declared dependencies; isolatedTask supplies sandbox allocation around an agent dispatch instead of a custom perform callback.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name                | Type                                                                   | Presence | Meaning                                                                                                  |
| ------------------- | ---------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `options`           | `TaskOptions<T>`                                                       | Required | Task identity, dependency edges, perform callback and attempt policy.                                    |
| `options.key`       | `string`                                                               | Required | Stable task key identifying the node within its workflow graph.                                          |
| `options.gate`      | `WorkflowGate \| undefined`                                            | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision. |
| `options.perform`   | `(context: TaskContext) => T \| Promise<T>`                            | Required | Callback executed for each task attempt; returns its output and must honor context.signal.               |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optional | Predicate evaluated before the first task attempt.                                                       |
| `options.retry`     | `Retry \| undefined`                                                   | Optional | Explicit retry policy; repeated effects require care.                                                    |
| `options.timeoutMs` | `number \| undefined`                                                  | Optional | Time limit in milliseconds for each task attempt; cancellation is cooperative through context.signal.    |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                | Optional | Declared task dependencies whose values may be read.                                                     |

## Returns

`Task<T>`

## Signature

```ts
export declare function task<T>(options: TaskOptions<T>): Task<T>;
```

## Related contracts

- [Task](../type-task/)
- [TaskOptions](../taskoptions/)
