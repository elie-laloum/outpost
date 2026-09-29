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

| Name       | Type                                     | Presence | Meaning                                                                                                                             |
| ---------- | ---------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `queue`    | `TaskQueue`                              | Required | Queue the worker claims jobs from and reports results to.                                                                           |
| `worker`   | `string`                                 | Required | Worker name recorded on each claimed job, 1 to 512 characters; give each process its own.                                           |
| `handlers` | `Readonly<Record<string, QueueHandler>>` | Required | Handlers by name, 1 to 100; the worker claims only jobs whose handler is listed here.                                               |
| `signal`   | `AbortSignal`                            | Required | Stops the worker: runQueueWorker() resolves and the running handler’s signal aborts. That job stays active until its lease expires. |
| `leaseMs`  | `number \| undefined`                    | Optional | Lease duration in milliseconds, default 30000, from 30 to 300000; renewed at every third of it.                                     |
| `pollMs`   | `number \| undefined`                    | Optional | Wait in milliseconds after finding no eligible job, default 250; must be positive.                                                  |

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
