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

| Name                | Type                                    | Presence | Meaning                                                                                                                                                                                                                                                                   |
| ------------------- | --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`              | `string`                                | Required | Logical queue name shared by all clients; hashed internally, so colons and Unicode are supported. Different names isolate job identities.                                                                                                                                 |
| `connection`        | `RedisOptions`                          | Required | BullMQ RedisOptions for standalone Redis, including host, port, db, username, password and tls. Supply settings, not a live client. The adapter owns connections and sets maxRetriesPerRequest to 1 for queue commands and null for BullMQ workers. Do not use keyPrefix. |
| `prefix`            | `string \| undefined`                   | Optional | Redis key prefix, default outpost. Keep it stable across restarts and identical on every client; use a dedicated namespace without external BullMQ consumers or cleanup.                                                                                                  |
| `stalledIntervalMs` | `number \| undefined`                   | Optional | Positive interval in milliseconds between BullMQ stalled-job checks, default 1000. Reclaiming an expired lease may require two checks; this is separate from leaseMs and pollMs.                                                                                          |
| `onError`           | `((error: Error) => void) \| undefined` | Optional | Optional synchronous observer for connection, stalled-check and native finalization errors. Observer exceptions are ignored. Foreground queue operations still reject on failure; a committed result remains authoritative if native finalization fails.                  |

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
