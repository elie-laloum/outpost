---
title: "Task"
description: "Task — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Task } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                                                   | Presence | Meaning                                                                                                  |
| ----------- | ---------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `key`       | `string`                                                               | Required | Stable task key identifying the node within its workflow graph.                                          |
| `gate`      | `WorkflowGate \| undefined`                                            | Optional | Persisted approval or pause definition; execution requires a checkpoint and a matching trusted decision. |
| `after`     | `readonly Task<unknown>[]`                                             | Required | Declared task dependencies whose values may be read.                                                     |
| `perform`   | `(context: TaskContext) => T \| Promise<T>`                            | Required | Callback executed for each task attempt; returns its output and must honor context.signal.               |
| `condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optional | Predicate evaluated before the first task attempt.                                                       |
| `retry`     | `Retry \| undefined`                                                   | Optional | Explicit retry policy; repeated effects require care.                                                    |
| `timeoutMs` | `number \| undefined`                                                  | Optional | Time limit in milliseconds for each task attempt; cancellation is cooperative through context.signal.    |

## Signature

```ts
export interface Task<T = unknown> {
  readonly key: string;
  readonly gate?: WorkflowGate;
  readonly after: readonly Task[];
  readonly perform: (context: TaskContext) => T | Promise<T>;
  readonly condition?: (context: TaskContext) => boolean | Promise<boolean>;
  readonly retry?: Retry;
  readonly timeoutMs?: number;
}
```

## Related contracts

- [Retry](../retry/)
- [TaskContext](../taskcontext/)
- [WorkflowGate](../workflowgate/)
