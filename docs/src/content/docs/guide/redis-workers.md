---
title: "Redis workers"
description: "Distribute jobs using BullMQ and standalone Redis."
---

Install `bullmq` and run a standalone Redis server. The adapter loads only through its optional package subpath.

Set `maxmemory-policy` to `noeviction` before opening a queue. Outpost checks Redis INFO and rejects other policies or an unavailable policy value; it never changes server configuration. Evicting expiring keys can discard worker locks. On Redis Cloud, edit the database **Data eviction policy** to **no eviction** in the provider console, save, and verify INFO reports `maxmemory_policy:noeviction`. When memory is full, writes fail instead of evicting queue state; monitor capacity and handle those errors.

```sh
npm install bullmq
```

```ts
import { bullmqTaskQueue } from "@elie-laloum/outpost/queues/bullmq";

const queue = await bullmqTaskQueue({
  name: "code-reviews",
  connection: { host: "127.0.0.1", port: 6379 },
});
try {
  await queue.enqueue({
    id: "review-42",
    handler: "review",
    input: { commit: "abc123" },
  });
} finally {
  await queue.close();
}
```

## Connect workers

Use the same `name`, `prefix`, Redis database and connection destination for producers and `runQueueWorker()` consumers. `connection` takes settings, not an already-owned Redis client. The adapter owns its connections and releases them on `close()`.

Do not supply `keyPrefix`; use Outpost’s `prefix` option. Keep the namespace dedicated to this adapter and do not attach unrelated native BullMQ consumers or cleanup jobs.

## Interrupted completion

Retained Outpost results remain authoritative if native BullMQ finalization is interrupted. Stalled-job recovery and lease expiry have different timing. The queue fences stale writes but cannot guarantee exactly-once external side effects.

Observe connection and finalization errors with `onError`. Foreground operations still reject on failure; an observer does not replace handling those rejections.

API: [bullmqTaskQueue](../../reference/bullmqtaskqueue/).
