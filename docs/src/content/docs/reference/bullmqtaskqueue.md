---
title: "bullmqTaskQueue"
description: "bullmqTaskQueue — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { bullmqTaskQueue } from "@elie-laloum/outpost/queues/bullmq";
```

## Purpose and behavior

Opens an optional BullMQ 5 adapter backed by standalone Redis. Implements TaskQueue for queuedTask and runQueueWorker, retaining request identity, lossless JSON results and atomic fenced leases. Owns its connections and stalled-job checks; await close() after stopping workers. Redis persistence and no-eviction settings determine durability. Import from @elie-laloum/outpost/queues/bullmq and install bullmq separately.

[Complete example and detailed rules](../../guide/advanced/distributed/).

## Parameters and properties

| Name                        | Type                                    | Presence | Meaning                                                                                                                                                                                                                                                                   |
| --------------------------- | --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                   | `BullMQTaskQueueOptions`                | Required | Redis connection settings and the stable namespace shared by producers and workers.                                                                                                                                                                                       |
| `options.name`              | `string`                                | Required | Logical queue name shared by all clients; hashed internally, so colons and Unicode are supported. Different names isolate job identities.                                                                                                                                 |
| `options.connection`        | `RedisOptions`                          | Required | BullMQ RedisOptions for standalone Redis, including host, port, db, username, password and tls. Supply settings, not a live client. The adapter owns connections and sets maxRetriesPerRequest to 1 for queue commands and null for BullMQ workers. Do not use keyPrefix. |
| `options.prefix`            | `string \| undefined`                   | Optional | Redis key prefix, default outpost. Keep it stable across restarts and identical on every client; use a dedicated namespace without external BullMQ consumers or cleanup.                                                                                                  |
| `options.stalledIntervalMs` | `number \| undefined`                   | Optional | Positive interval in milliseconds between BullMQ stalled-job checks, default 1000. Reclaiming an expired lease may require two checks; this is separate from leaseMs and pollMs.                                                                                          |
| `options.onError`           | `((error: Error) => void) \| undefined` | Optional | Optional synchronous observer for connection, stalled-check and native finalization errors. Observer exceptions are ignored. Foreground queue operations still reject on failure; a committed result remains authoritative if native finalization fails.                  |

## Returns

`Promise<BullMQTaskQueue>`

## Signature

```ts
export declare function bullmqTaskQueue(
  options: BullMQTaskQueueOptions,
): Promise<BullMQTaskQueue>;
```

## Related contracts

- [BullMQTaskQueue](../type-bullmqtaskqueue/)
- [BullMQTaskQueueOptions](../bullmqtaskqueueoptions/)
