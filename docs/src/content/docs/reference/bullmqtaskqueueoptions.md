---
title: "BullMQTaskQueueOptions"
description: "BullMQTaskQueueOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { BullMQTaskQueueOptions } from "@elie-laloum/outpost/queues/bullmq";
```

## Parameters and properties

| Name                | Type                                    | Presence | Meaning                                                                                                                                                                                   |
| ------------------- | --------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`              | `string`                                | Required | Logical queue name shared by all clients; hashed internally, so colons and Unicode are supported. Different names isolate job identities.                                                 |
| `connection`        | `RedisOptions`                          | Required | RedisOptions for standalone Redis (host, port, db, username, password, tls), not a live client. Connect and command timeouts default to 10000; keyPrefix is rejected, use prefix instead. |
| `prefix`            | `string \| undefined`                   | Optional | Redis key prefix, default outpost. Keep it stable across restarts and identical on every client; use a dedicated namespace without external BullMQ consumers or cleanup.                  |
| `stalledIntervalMs` | `number \| undefined`                   | Optional | Positive interval in milliseconds between BullMQ stalled-job checks, default 1000. Reclaiming an expired lease may require two checks; this is separate from leaseMs and pollMs.          |
| `onError`           | `((error: Error) => void) \| undefined` | Optional | Synchronous observer for connection, stalled-check and BullMQ finalization errors; its exceptions are ignored. Queue operations still reject on their own failures.                       |

## Signature

```ts
import type { RedisOptions } from "bullmq";

export interface BullMQTaskQueueOptions {
  readonly name: string;
  readonly connection: RedisOptions;
  readonly prefix?: string;
  readonly stalledIntervalMs?: number;
  readonly onError?: (error: Error) => void;
}
```
