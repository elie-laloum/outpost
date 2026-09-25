---
title: "runQueueWorker"
description: "runQueueWorker — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { runQueueWorker } from "@elie-laloum/outpost";
```

## Purpose and behavior

Poll for jobs whose handler is registered, run one job at a time and renew its fenced lease while executing. Record JSON results and observed usage, honor cancellation and deadlines, and reject stale completions; external effects may repeat after lease loss.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name               | Type                                     | Presence | Meaning                                                                                 |
| ------------------ | ---------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| `options`          | `QueueWorkerOptions`                     | Required | Queue client, worker identity, handler registry, lease renewal timing and cancellation. |
| `options.queue`    | `TaskQueue`                              | Required | Task queue used to enqueue, claim and persist job state.                                |
| `options.worker`   | `string`                                 | Required | Identity of the worker claiming or owning the job lease.                                |
| `options.handlers` | `Readonly<Record<string, QueueHandler>>` | Required | Registry mapping handler names to their job execution callbacks.                        |
| `options.signal`   | `AbortSignal`                            | Required | Cooperative cancellation for this operation.                                            |
| `options.leaseMs`  | `number \| undefined`                    | Optional | Worker lease duration in milliseconds.                                                  |
| `options.pollMs`   | `number \| undefined`                    | Optional | Interval in milliseconds between queue polls.                                           |

## Returns

`Promise<void>`

## Signature

```ts
export declare function runQueueWorker(
  options: QueueWorkerOptions,
): Promise<void>;
```

## Related contracts

- [QueueWorkerOptions](../queueworkeroptions/)
