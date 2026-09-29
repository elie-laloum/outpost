---
title: "createBullMQTaskQueue"
description: "createBullMQTaskQueue — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createBullMQTaskQueue } from "@elie-laloum/outpost/queues/bullmq";
```

## Purpose and behavior

Open a TaskQueue on standalone Redis through BullMQ 5; import it from @elie-laloum/outpost/queues/bullmq and install bullmq separately. Rejects a server whose maxmemory-policy is not noeviction, without changing its configuration. The queue owns its Redis connections: stop the workers, then await close().

[Complete example and detailed rules](../../guide/redis-workers/).

## Parameters and properties

| Name                        | Type                                    | Presence | Meaning                                                                                                                                                                                   |
| --------------------------- | --------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                   | `BullMQTaskQueueOptions`                | Required | Redis connection settings and the stable namespace shared by producers and workers.                                                                                                       |
| `options.name`              | `string`                                | Required | Logical queue name shared by all clients; hashed internally, so colons and Unicode are supported. Different names isolate job identities.                                                 |
| `options.connection`        | `RedisOptions`                          | Required | RedisOptions for standalone Redis (host, port, db, username, password, tls), not a live client. Connect and command timeouts default to 10000; keyPrefix is rejected, use prefix instead. |
| `options.prefix`            | `string \| undefined`                   | Optional | Redis key prefix, default outpost. Keep it stable across restarts and identical on every client; use a dedicated namespace without external BullMQ consumers or cleanup.                  |
| `options.stalledIntervalMs` | `number \| undefined`                   | Optional | Positive interval in milliseconds between BullMQ stalled-job checks, default 1000. Reclaiming an expired lease may require two checks; this is separate from leaseMs and pollMs.          |
| `options.onError`           | `((error: Error) => void) \| undefined` | Optional | Synchronous observer for connection, stalled-check and BullMQ finalization errors; its exceptions are ignored. Queue operations still reject on their own failures.                       |

## Returns

`Promise<BullMQTaskQueue>`

## Signature

```ts
export declare function createBullMQTaskQueue(
  options: BullMQTaskQueueOptions,
): Promise<BullMQTaskQueue>;
```

## Related contracts

- [BullMQTaskQueue](../type-bullmqtaskqueue/)
- [BullMQTaskQueueOptions](../bullmqtaskqueueoptions/)
