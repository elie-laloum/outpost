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

| Name        | Type                                                                   | Presence | Meaning                                                                                                  |
| ----------- | ---------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `key`       | `string`                                                               | Required | Stable task key identifying the node within its workflow graph.                                          |
| `gate`      | `WorkflowGate \| undefined`                                            | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision. |
| `perform`   | `(context: TaskContext) => T \| Promise<T>`                            | Required | Callback executed for each task attempt; returns its output and must honor context.signal.               |
| `condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optional | Predicate evaluated before the first task attempt.                                                       |
| `retry`     | `Retry \| undefined`                                                   | Optional | Explicit retry policy; repeated effects require care.                                                    |
| `timeoutMs` | `number \| undefined`                                                  | Optional | Time limit in milliseconds for each task attempt; cancellation is cooperative through context.signal.    |
| `after`     | `readonly Task<unknown>[] \| undefined`                                | Optional | Declared task dependencies whose values may be read.                                                     |

## Signature

```ts
export type TaskOptions<T> = Omit<Task<T>, "after"> & {
  readonly after?: readonly Task[];
};
```

## Related contracts

- [Task](../type-task/)
