---
title: "Run a task through an HTTP worker"
description: "Run a real SQLite queue, HTTP coordinator and worker together on loopback before separating hosts."
---

Run a real SQLite queue, HTTP coordinator and worker together on loopback before separating hosts.

<!-- scenario:offline -->

<!-- preparation:offline -->

<details>
<summary>Prepare this example from scratch</summary>

Use Node.js **24+** and npm. Start in a new directory for each example.

```sh
mkdir outpost-example
cd outpost-example
```

```sh
npm init -y
npm install @elie-laloum/outpost
```

Save the example as **example.mts** in this directory. No account, API key or container is needed.

</details>

<!-- /preparation -->

## Try it

Save **example.mts** in `outpost-example/`.

```ts file=example.mts
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdir } from "node:fs/promises";
import {
  sqliteTaskQueue,
  serveTaskQueue,
  httpTaskQueue,
  runQueueWorker,
  queuedTask,
  workflow,
} from "@elie-laloum/outpost";

await mkdir("state", { recursive: true });
const storage = await sqliteTaskQueue("./state/jobs.sqlite");
const token = randomBytes(32).toString("hex");
const server = await serveTaskQueue({ queue: storage, token, port: 0 });
const queue = httpTaskQueue({ url: server.url, token });
const stop = new AbortController();
const worker = runQueueWorker({
  queue,
  worker: "text-worker",
  signal: stop.signal,
  handlers: {
    slug(input) {
      if (typeof input !== "string") throw new Error("Expected text");
      return { value: input.trim().toLowerCase().replace(/\s+/g, "-") };
    },
  },
});
try {
  const convert = queuedTask({
    key: "slug",
    queue,
    handler: "slug",
    input: () => "Hello World",
    decode(value) {
      if (typeof value !== "string")
        throw new Error("Expected a string result");
      return value;
    },
  });
  const result = await workflow("queued-text", [convert]).start({
    signal: AbortSignal.timeout(10_000),
  });
  result.unwrap();
  assert.equal(result.value(convert), "hello-world");
  console.log(result.value(convert));
} finally {
  stop.abort();
  await worker;
  await server.close();
  storage.close();
}
```

```sh
node example.mts
```

## Understand the result

The worker returns `hello-world`. This exercise uses HTTP and SQLite, but all components run on your computer. The server closes and the worker stops in `finally`; the database remains in `state/`. Separate hosts need an authenticated HTTPS endpoint or encrypted tunnel. Queue leases fence stale completions but do not guarantee exactly-once external effects.

[Contracts, options and edge cases](../../behavior/workflows/distributed/).

Any persisted example files remain inside this demonstration directory.

To use Redis directly, follow the [BullMQ/Redis guide](../bullmq/).
