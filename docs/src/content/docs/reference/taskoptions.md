---
title: "TaskOptions"
description: "TaskOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { TaskOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                                                   | Presence | Meaning                                                                                                                                  |
| ----------- | ---------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `retry`     | `Retry \| undefined`                                                   | Optional | Explicit retry policy; repeated effects require care.                                                                                    |
| `gate`      | `WorkflowGate \| undefined`                                            | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision.                                 |
| `key`       | `string`                                                               | Required | Stable task key identifying the node within its workflow graph.                                                                          |
| `perform`   | `(context: TaskContext) => T \| Promise<T>`                            | Required | Callback executed for each task attempt; returns its output and must honor context.signal.                                               |
| `condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optional | Predicate evaluated before the first task attempt.                                                                                       |
| `timeoutMs` | `number \| undefined`                                                  | Optional | Positive integer time limit in milliseconds for each task attempt, up to 2147483647; cancellation is cooperative through context.signal. |
| `after`     | `readonly Task<unknown>[] \| undefined`                                | Optional | Declared task dependencies whose values may be read.                                                                                     |

## Signature

```ts
export type TaskOptions<T> = Omit<Task<T>, "after"> & {
  readonly after?: readonly Task[];
};
```

## Related contracts

- [Task](../type-task/)
