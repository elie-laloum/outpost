---
title: "Share a queue over HTTP"
description: "Connect producers and workers through an authenticated queue endpoint."
---

Use an HTTP queue when producers and workers cannot open the same local database. This exposes the queue from [Run jobs with workers](../job-queues/); the handlers still run in workers. Put a TLS reverse proxy in front of the endpoint for remote access. A bearer token authorizes every queue operation, not one tenant or handler.

## Expose a queue over HTTP

`serveTaskQueue()` puts any queue behind an HTTP endpoint. `createHttpTaskQueue()` is a queue client for producers and workers on other machines.

```ts title="queue-server.ts"
import { createSqliteTaskQueue, serveTaskQueue } from "@elie-laloum/outpost";

const token = process.env.OUTPOST_QUEUE_TOKEN;
if (!token) throw new Error("Set OUTPOST_QUEUE_TOKEN");

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const server = await serveTaskQueue({ queue, token, port: 8788 });
console.log(`Queue at ${server.url}`);
// Example output: Queue at http://127.0.0.1:8788
```

On another machine, `createHttpTaskQueue({ url, token })` returns a queue for `runQueueWorker()` or `enqueue()`. The token is 32 to 512 characters without spaces. The server listens on `127.0.0.1` unless you set `host`; `await server.close()` stops it, and you close the underlying queue yourself.

To rotate tokens, give `token` a function, read on every request. The server's returns the accepted tokens; an empty list or an error rejects every request.

1. Let the server accept both the old and new tokens.
2. Switch clients to the new token, including lease renewals and job completions.
3. Remove the old token from the server once all clients have switched.

## Try a client

Run `node queue-server.ts` and `worker.ts` from [Jobs and workers](../job-queues/) in the same directory: they open the same SQLite database. In a third terminal, give the client the same `OUTPOST_QUEUE_TOKEN`, then run `node submit-http.ts`. Run it again after processing to read the value `3`. This local test needs no proxy.

```ts title="submit-http.ts"
import { createHttpTaskQueue } from "@elie-laloum/outpost";

const token = process.env.OUTPOST_QUEUE_TOKEN;
if (!token) throw new Error("Set OUTPOST_QUEUE_TOKEN");
const queue = createHttpTaskQueue({ url: "http://127.0.0.1:8788", token });
await queue.enqueue({ id: "http-count-1", handler: "count", input: [1, 2, 3] });
console.log(await queue.get("http-count-1"));
```
