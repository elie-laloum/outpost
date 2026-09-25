---
title: Run a task through BullMQ and Redis
description: Use the optional BullMQ adapter with the existing Outpost worker and workflow contracts.
---

The optional `bullmqTaskQueue` adapter connects `queuedTask` and `runQueueWorker` directly to standalone Redis. SQLite and the HTTP coordinator remain available. This adapter is available since Outpost 4.2.0.

<details>
<summary>Prepare this example from scratch</summary>

Use Node.js **24+**, npm and Docker. No model account or agent credentials are needed. Create a separate demonstration directory and install Outpost 4.2.0 or later with the optional BullMQ dependency:

```sh
mkdir outpost-redis-example
cd outpost-redis-example
npm init -y
npm install '@elie-laloum/outpost@^4.2.0' 'bullmq@^5.81.5'
docker run -d --name outpost-redis-demo \
  -p 127.0.0.1:6379:6379 -v outpost-redis-demo:/data \
  redis:7-alpine redis-server --appendonly yes --maxmemory-policy noeviction
```

This Redis instance is accessible only on local loopback. Its named volume retains data. Save the following file as **example.mts** in the demonstration directory.

</details>

## Try it

```ts file=example.mts
import assert from "node:assert/strict";
import { bullmqTaskQueue } from "@elie-laloum/outpost/queues/bullmq";
import { queuedTask, runQueueWorker, workflow } from "@elie-laloum/outpost";

const queue = await bullmqTaskQueue({
  name: "calculations",
  connection: { host: "127.0.0.1", port: 6379 },
  onError: (error) => console.error(error.message),
});
const stop = new AbortController();
const worker = runQueueWorker({
  queue,
  worker: "calculator-1",
  signal: stop.signal,
  handlers: {
    double(input) {
      if (typeof input !== "number") throw new Error("Expected a number");
      return { value: input * 2 };
    },
  },
});
try {
  const calculate = queuedTask({
    key: "double",
    queue,
    handler: "double",
    input: () => 21,
    decode(value) {
      if (typeof value !== "number") throw new Error("Expected a number");
      return value;
    },
  });
  const result = await workflow("redis-calculation", [calculate]).start({
    signal: AbortSignal.timeout(10_000),
  });
  result.unwrap();
  assert.equal(result.value(calculate), 42);
  console.log(result.value(calculate));
} finally {
  stop.abort();
  try {
    await worker;
  } finally {
    await queue.close();
  }
}
```

```sh
node example.mts
```

## Understand the result

The worker prints `42`. The example stops the worker before awaiting `queue.close()`, which closes the adapter's connections without deleting records. For separate producer and worker processes, open an adapter on each with identical `name`, `prefix` and Redis database settings. Register trusted handlers on the workers; no executable code or credentials travel in the queue. Keep the worker's abort controller and shutdown sequence in its own process.

Each handler uses a separate internal BullMQ queue. The adapter rotates among the requested handlers and never gives a worker an unsupported handler. It does not promise global FIFO ordering across handlers. Stop the demonstration Redis with `docker stop outpost-redis-demo`; start it again with `docker start outpost-redis-demo`. The volume and retained jobs remain until explicitly removed.

## Ownership and recovery

- Request IDs are unique across the logical queue, including different handlers. Re-enqueueing the exact same request returns its existing state; different input, handler or deadline is rejected. Arbitrary supported identifiers, including colons and Unicode, are encoded internally.
- Leases use Redis server time. Atomic Redis transitions check the worker, fencing generation, lease expiry and native BullMQ lock. Renewal extends that same lock. Cancellation and deadlines reject subsequent renewals and results from the previous owner; handlers still need to honor their abort signal.
- BullMQ stalled-job checks recover abandoned native claims. The default `stalledIntervalMs` is 1000; recovery can need two checks after a lock expires. An interruption before recording the Outpost claim can leave BullMQ's initial 30-second lock. Active work is not automatically retried after a terminal handler error; a new workflow execution creates a new logical job.
- Requests and results retain their original JSON encoding; Redis Lua never decodes and re-encodes application values. Empty arrays/objects and JavaScript numeric precision survive storage.
- Enqueue reserves the request identity before publishing the BullMQ job. If publication fails or its acknowledgement is lost, retry **the same request** to finish admission; `get()` alone does not republish an unfinished admission. An enqueue error does not prove the task was never accepted.
- Completion commits the Outpost result before finalizing the BullMQ job. If native finalization fails, `get()` still returns the durable result; subsequent claims finalize that job without running its handler again. BullMQ's native status can temporarily lag Outpost's status, including for cancellation. `onError` observes background and finalization errors; observer exceptions do not alter outcomes.

External effects remain **at least once**. Use `job.id` as an idempotency key. Preserve the [existing workflow retry, usage and cancellation rules](../../behavior/workflows/distributed/). Await `close()` after stopping workers; it rejects new operations, waits for admitted operations and retains active leases for recovery. It does not cancel handlers or erase jobs.

## Operate Redis deliberately

Install BullMQ 5 separately; importing the base Outpost package does not load it. The adapter accepts BullMQ `RedisOptions` for a standalone connection, including `username`, `password`, `db` and `tls`. Supply credentials from environment variables or a secret manager. Connections belong to the adapter. Queue commands use `maxRetriesPerRequest: 1`; internal BullMQ workers use `null`. Connection and command timeouts default to 10 seconds, with three reconnection attempts delayed by 100, 200 and 300 ms. Your connection options can override those defaults. Reopen the adapter after reconnection attempts are exhausted; configure timeouts and retries for your deployment. Foreground failures reject and `runQueueWorker` stops, so supervise worker processes.

Configure persistence, backups and `maxmemory-policy noeviction`; Redis durability depends on those settings and replication/failover behavior. TLS and access controls are deployment responsibilities. This first adapter targets standalone Redis; Redis Cluster is not supported or validated. Tests use real Redis without paid model calls; they do not establish production failover guarantees.

Use a dedicated `prefix` (default `outpost`) and stable `name`. Do not attach ordinary BullMQ processors, manually retry jobs, enable automatic removal or delete BullMQ/Outpost keys in this namespace. Native queues and Outpost state together preserve identity, fencing and terminal history. No automatic retention is provided: delete a whole namespace only when none of its workflows can resume and all clients have stopped.

See [bullmqTaskQueue](../../../reference/bullmqtaskqueue/), [BullMQTaskQueueOptions](../../../reference/bullmqtaskqueueoptions/) and the [BullMQ manual processing documentation](https://docs.bullmq.io/patterns/manually-fetching-jobs).
