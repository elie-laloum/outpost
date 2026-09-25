---
title: "queuedTask"
description: "queuedTask — Outpost API"
sidebar:
  order: 10
---

Public contract for **queuedTask**. See the [distributed execution guide](../../guide/advanced/distributed/) for behavior, defaults and examples.

## Import

```ts
import { queuedTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Coordinate durable JSON jobs through a SQLite queue, authenticated HTTP transport and registered workers.

Effects are at least once. Stale fences cannot complete queue state, but external effects may repeat. HTTP binds loopback by default and supplies no TLS. One worker handles one job at a time.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name                | Type                                                                   | Presence | Meaning                                                                                  |
| ------------------- | ---------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`           | `QueuedTaskOptions<T>`                                                 | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                | Optional | Declared task dependencies whose values may be read.                                     |
| `options.key`       | `string`                                                               | Required | Stable task or cache key within its owning contract.                                     |
| `options.gate`      | `WorkflowGate \| undefined`                                            | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optional | Predicate evaluated before the first task attempt.                                       |
| `options.retry`     | `Retry \| undefined`                                                   | Optional | Explicit retry policy; repeated effects require care.                                    |
| `options.timeoutMs` | `number \| undefined`                                                  | Optional | Time limit in milliseconds for the owning operation.                                     |
| `options.queue`     | `TaskQueue`                                                            | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.handler`   | `string`                                                               | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.input`     | `(context: TaskContext) => WorkflowJson`                               | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.decode`    | `(value: WorkflowJson) => T`                                           | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.deadline`  | `number \| undefined`                                                  | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.pollMs`    | `number \| undefined`                                                  | Optional | See the linked contract and this family's rules for its interpretation.                  |

## Returns

`Task<T>`

## Signature

```ts
export declare function queuedTask<T>(options: QueuedTaskOptions<T>): Task<T>;
```

## Related contracts

- [QueuedTaskOptions](../queuedtaskoptions/)
- [Task](../task/)
