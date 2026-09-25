---
title: "task"
description: "task — Outpost API"
sidebar:
  order: 10
---

Public contract for **task**. See the [workflows guide](../../guide/workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import { task } from "@elie-laloum/outpost";
```

## Purpose and behavior

Compose tasks with explicit dependency edges and typed result access.

Duplicate keys, missing dependencies and cycles fail validation. Failed or skipped dependencies skip descendants. Retries can repeat external effects. Unwrap throws on a non-successful result.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name                | Type                                                                   | Presence | Meaning                                                                                  |
| ------------------- | ---------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`           | `TaskOptions<T>`                                                       | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.key`       | `string`                                                               | Required | Stable task or cache key within its owning contract.                                     |
| `options.gate`      | `WorkflowGate \| undefined`                                            | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.perform`   | `(context: TaskContext) => T \| Promise<T>`                            | Required | Task implementation; honor its cancellation signal.                                      |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optional | Predicate evaluated before the first task attempt.                                       |
| `options.retry`     | `Retry \| undefined`                                                   | Optional | Explicit retry policy; repeated effects require care.                                    |
| `options.timeoutMs` | `number \| undefined`                                                  | Optional | Time limit in milliseconds for the owning operation.                                     |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                | Optional | Declared task dependencies whose values may be read.                                     |

## Returns

`Task<T>`

## Signature

```ts
export declare function task<T>(options: TaskOptions<T>): Task<T>;
```

## Related contracts

- [Task](../task/)
- [TaskOptions](../taskoptions/)
