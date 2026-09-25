---
title: "QueueWorkerOptions"
description: "QueueWorkerOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueWorkerOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                                     | Presence | Meaning                                                          |
| ---------- | ---------------------------------------- | -------- | ---------------------------------------------------------------- |
| `queue`    | `TaskQueue`                              | Required | Task queue used to enqueue, claim and persist job state.         |
| `worker`   | `string`                                 | Required | Identity of the worker claiming or owning the job lease.         |
| `handlers` | `Readonly<Record<string, QueueHandler>>` | Required | Registry mapping handler names to their job execution callbacks. |
| `signal`   | `AbortSignal`                            | Required | Cooperative cancellation for this operation.                     |
| `leaseMs`  | `number \| undefined`                    | Optional | Worker lease duration in milliseconds.                           |
| `pollMs`   | `number \| undefined`                    | Optional | Interval in milliseconds between queue polls.                    |

## Signature

```ts
export interface QueueWorkerOptions {
  readonly queue: TaskQueue;
  readonly worker: string;
  readonly handlers: Readonly<Record<string, QueueHandler>>;
  readonly signal: AbortSignal;
  readonly leaseMs?: number;
  readonly pollMs?: number;
}
```

## Related contracts

- [QueueHandler](../queuehandler/)
- [TaskQueue](../taskqueue/)
