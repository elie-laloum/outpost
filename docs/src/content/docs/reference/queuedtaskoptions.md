---
title: "QueuedTaskOptions"
description: "QueuedTaskOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueuedTaskOptions**. See the [distributed execution guide](../../guide/advanced/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueuedTaskOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Coordinate durable JSON jobs through a SQLite queue, authenticated HTTP transport and registered workers.

Effects are at least once. Stale fences cannot complete queue state, but external effects may repeat. HTTP binds loopback by default and supplies no TLS. One worker handles one job at a time.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name        | Type                                                                   | Presence | Meaning                                                                 |
| ----------- | ---------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `after`     | `readonly Task<unknown>[] \| undefined`                                | Optional | Declared task dependencies whose values may be read.                    |
| `key`       | `string`                                                               | Required | Stable task or cache key within its owning contract.                    |
| `gate`      | `WorkflowGate \| undefined`                                            | Optional | See the linked contract and this family's rules for its interpretation. |
| `condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optional | Predicate evaluated before the first task attempt.                      |
| `retry`     | `Retry \| undefined`                                                   | Optional | Explicit retry policy; repeated effects require care.                   |
| `timeoutMs` | `number \| undefined`                                                  | Optional | Time limit in milliseconds for the owning operation.                    |
| `queue`     | `TaskQueue`                                                            | Required | See the linked contract and this family's rules for its interpretation. |
| `handler`   | `string`                                                               | Required | See the linked contract and this family's rules for its interpretation. |
| `input`     | `(context: TaskContext) => WorkflowJson`                               | Required | See the linked contract and this family's rules for its interpretation. |
| `decode`    | `(value: WorkflowJson) => T`                                           | Required | See the linked contract and this family's rules for its interpretation. |
| `deadline`  | `number \| undefined`                                                  | Optional | See the linked contract and this family's rules for its interpretation. |
| `pollMs`    | `number \| undefined`                                                  | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export type QueuedTaskOptions<T> = Omit<TaskOptions<T>, "perform"> & {
  readonly queue: TaskQueue;
  readonly handler: string;
  readonly input: (context: TaskContext) => WorkflowJson;
  readonly decode: (value: WorkflowJson) => T;
  readonly deadline?: number;
  readonly pollMs?: number;
};
```

## Related contracts

- [TaskContext](../taskcontext/)
- [TaskOptions](../taskoptions/)
- [TaskQueue](../taskqueue/)
- [WorkflowJson](../workflowjson/)
