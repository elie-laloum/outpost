---
title: Run distributed workers
description: Durable task queues, HTTP workers, leases and fencing.
sidebar:
  order: 8
---

Use a coordinator when tasks must run on separate hosts. The coordinator stores JSON jobs in SQLite; workers pull only handler names registered in their own process. Install Outpost and Node.js 24+ on each host. The built-in `node:sqlite` module loads only when opening a store.

## Start a coordinator

Generate a random shared bearer token (at least 32 non-whitespace characters) and inject it through your secret manager as `OUTPOST_QUEUE_TOKEN`. All clients holding this token can enqueue, claim, inspect and cancel jobs. This is a shared trust boundary, without per-worker authorization or tenant isolation.

```ts
import { sqliteTaskQueue, serveTaskQueue } from "@elie-laloum/outpost";

const token = process.env.OUTPOST_QUEUE_TOKEN;
if (!token) throw new Error("OUTPOST_QUEUE_TOKEN is required");
const queue = await sqliteTaskQueue("./private/queue.sqlite");
const server = await serveTaskQueue({ queue, token, port: 8787 });
console.log(server.url);

process.once("SIGINT", async () => {
  await server.close();
  queue.close();
});
```

The default address is loopback (`127.0.0.1`). For other hosts, put an authenticated HTTPS reverse proxy in front, or use a private encrypted tunnel. Set `host` explicitly only when the network boundary is configured. The HTTP server itself does not provide TLS. Never put the token in a URL or tracked source. The client rejects redirects and URL credentials; authentication errors do not echo credentials.

Run one coordinator service with its SQLite file on durable **local disk**, not a network filesystem. SQLite transactions serialize claims and persist monotonically increasing fencing tokens across restarts. The file is created with owner-only permissions where supported. Back up the database with a SQLite-aware tool or while the coordinator is stopped. Keep terminal records for the lifetime of checkpointed runs: they are the deduplication history. Automatic retention, replication and coordinator failover are not provided; rotate databases only after their workflows can no longer resume. Claims select one eligible job through a metadata index without loading terminal payload history. A single synchronous SQLite coordinator is intended for modest throughput.

## Start workers

On each worker host, inject `OUTPOST_QUEUE_URL` (the HTTPS endpoint or local tunnel URL) and the same token. Save this as `worker.ts`, then run `node worker.ts`. The example deliberately registers a small JSON operation; replace it with trusted application code that allocates its own sandbox and credentials.

```ts
import { httpTaskQueue, runQueueWorker } from "@elie-laloum/outpost";

const url = process.env.OUTPOST_QUEUE_URL;
const token = process.env.OUTPOST_QUEUE_TOKEN;
if (!url || !token) throw new Error("Queue URL and token are required");
const queue = httpTaskQueue({ url, token });
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
await runQueueWorker({
  queue,
  worker: process.env.WORKER_ID ?? "worker-1",
  signal: stop.signal,
  leaseMs: 30_000,
  handlers: {
    double(input, { signal }) {
      signal.throwIfAborted();
      if (typeof input !== "number") throw new Error("Expected a number");
      return { value: input * 2 };
    },
  },
});
```

Each worker runs one handler at a time; run several worker processes with distinct IDs for concurrency. Handlers receive the JSON input and `{ signal, job }`, including `job.id` and `job.fence`. No JavaScript functions, shell commands, repositories or credentials are implicitly transferred. Validate your handler inputs and explicitly configure sandbox allocation, repository access and result transfer on each worker.

Heartbeats renew leases every third of the lease interval. Choose a lease longer than expected coordinator latency and event-loop stalls. A missing heartbeat makes the job eligible for another worker. Lost ownership, cancellation, a deadline or worker shutdown aborts the handler signal. Handlers must honor it and await cleanup; Outpost cannot forcibly stop arbitrary JavaScript. Transport errors stop the worker so a process supervisor can restart it; unfinished leases remain reclaimable.

## Submit from a workflow

```ts
import {
  fileWorkflowCheckpointStore,
  httpTaskQueue,
  queuedTask,
  workflow,
} from "@elie-laloum/outpost";

const url = process.env.OUTPOST_QUEUE_URL;
const token = process.env.OUTPOST_QUEUE_TOKEN;
if (!url || !token) throw new Error("Queue URL and token are required");
const queue = httpTaskQueue({ url, token });
const double = queuedTask({
  key: "double",
  queue,
  handler: "double",
  input: () => 21,
  decode(value) {
    if (typeof value !== "number") throw new Error("Expected a number");
    return value;
  },
});
const result = await workflow("remote-calculation", [double]).start({
  checkpoint: {
    store: fileWorkflowCheckpointStore({ directory: "./private/checkpoints" }),
    runId: "calculation-1",
    version: "double-v1",
  },
});
result.unwrap();
console.log(result.value(double)); // 42
```

`queuedTask` derives the job ID from the persisted workflow execution ID and task key, independent of the attempt number. Explicit checkpoint resume reconnects to that same job after a caller crash or connection loss. Keep inputs and any absolute `deadline` stable for that run; duplicate enqueue with different input, handler or deadline fails. Ordinary workflow retries reconnect to the same terminal failure; start a new workflow run to execute a failed logical job again. Lease expiry can reassign an unfinished job without creating another logical job.

Set `deadline` to an absolute Unix time in milliseconds to limit queue waiting and execution across caller restarts. Workflow timeout/cancellation requests cancellation using the latest observed fence. A concurrent reassignment may reject that cancellation, and an unreachable coordinator cannot acknowledge it; set a durable deadline where stopping unattended jobs matters. Deadlines are evaluated on coordinator operations, including heartbeat and polling. Worker clock synchronization is unnecessary; coordinator wall-clock correctness matters.

## Delivery and accounting guarantees

Execution is **at least once**. A worker can finish an external action and crash before recording its result. A replacement may execute that action again. Queue completion, renewal and cancellation reject stale fences; this protects queue state, not external systems. Use the logical job ID as an idempotency key and pass its fencing token into any external system that supports rejecting older writers. Cancellation revokes queue ownership but cannot undo effects already committed elsewhere.

The low-level `TaskQueue` port exposes `enqueue`, `get`, `claim`, `renew`, `complete` and `cancel`. `cancel(id, fence)` requires the caller's current observed fence. Terminal results are immutable. Workers return `{ value, usage?, error? }`; `error` records a failed logical job. JSON input and output values are each limited to 256 KiB, messages to 1 MiB, identifiers/errors to 512 characters and leases to 30–300,000 ms. HTTP requests default to a 10-second timeout. Results, inputs and handler errors are persisted and can contain sensitive project data; protect the database and authorized clients accordingly.

`queuedTask` reports terminal `usage` to the workflow budget, including failed results. Usage becomes visible after completion; a workflow budget is not a live remote billing cap. Crashed, cancelled or fenced-out attempts may have consumed resources that were never reported. The workflow persists a per-task usage receipt with accounting, so retry or resume does not count the same terminal job twice. `TaskContext.reportUsageOnce(receipt, usage)` also supports custom durable adapters; receipt identifiers are limited to 512 characters and 65,536 receipts per task. Custom task contexts without this optional method fall back to ordinary usage reporting and must deduplicate repeated reports themselves. Reconcile actual consumption with your provider when it matters. A decoder must validate the JSON result before the workflow exposes its typed value.
