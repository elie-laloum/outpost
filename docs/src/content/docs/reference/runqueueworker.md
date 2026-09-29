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

Claim jobs for the registered handlers and run them one at a time until signal aborts, renewing each lease at every third of leaseMs. A thrown error or a result with error marks the job failed; a lost lease or a cancellation aborts the handler’s signal and stores nothing. Resolves once signal aborts and rejects when a queue operation fails.

[Complete example and detailed rules](../../guide/job-queues/).

## Parameters and properties

| Name               | Type                                     | Presence | Meaning                                                                                                                             |
| ------------------ | ---------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `options`          | `QueueWorkerOptions`                     | Required | Queue, worker name, handlers, stop signal, and lease and polling timings.                                                           |
| `options.queue`    | `TaskQueue`                              | Required | Queue the worker claims jobs from and reports results to.                                                                           |
| `options.worker`   | `string`                                 | Required | Worker name recorded on each claimed job, 1 to 512 characters; give each process its own.                                           |
| `options.handlers` | `Readonly<Record<string, QueueHandler>>` | Required | Handlers by name, 1 to 100; the worker claims only jobs whose handler is listed here.                                               |
| `options.signal`   | `AbortSignal`                            | Required | Stops the worker: runQueueWorker() resolves and the running handler’s signal aborts. That job stays active until its lease expires. |
| `options.leaseMs`  | `number \| undefined`                    | Optional | Lease duration in milliseconds, default 30000, from 30 to 300000; renewed at every third of it.                                     |
| `options.pollMs`   | `number \| undefined`                    | Optional | Wait in milliseconds after finding no eligible job, default 250; must be positive.                                                  |

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
