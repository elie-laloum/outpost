---
title: "TaskOptions"
description: "TaskOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **TaskOptions**. See the [workflows guide](../../guide/workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import type { TaskOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Compose tasks with explicit dependency edges and typed result access.

Duplicate keys, missing dependencies and cycles fail validation. Failed or skipped dependencies skip descendants. Retries can repeat external effects. Unwrap throws on a non-successful result.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name        | Type                                                                   | Presence | Meaning                                                                 |
| ----------- | ---------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `key`       | `string`                                                               | Required | Stable task or cache key within its owning contract.                    |
| `gate`      | `WorkflowGate \| undefined`                                            | Optional | See the linked contract and this family's rules for its interpretation. |
| `perform`   | `(context: TaskContext) => T \| Promise<T>`                            | Required | Task implementation; honor its cancellation signal.                     |
| `condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optional | Predicate evaluated before the first task attempt.                      |
| `retry`     | `Retry \| undefined`                                                   | Optional | Explicit retry policy; repeated effects require care.                   |
| `timeoutMs` | `number \| undefined`                                                  | Optional | Time limit in milliseconds for the owning operation.                    |
| `after`     | `readonly Task<unknown>[] \| undefined`                                | Optional | Declared task dependencies whose values may be read.                    |

## Signature

```ts
export type TaskOptions<T> = Omit<Task<T>, "after"> & {
  readonly after?: readonly Task[];
};
```

## Related contracts

- [Task](../task/)
