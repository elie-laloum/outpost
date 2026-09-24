import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { createServer } from "node:http";
import {
  sqliteTaskQueue,
  serveTaskQueue,
  httpTaskQueue,
  runQueueWorker,
  queuedTask,
  workflow,
  fileWorkflowCheckpointStore,
} from "../../src/index.ts";
import type { TaskQueue, QueueHandler, QueueJob } from "../../src/index.ts";

const token = "test-only-token-with-at-least-32-characters";
async function fixture(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-queue-"));
  const path = join(directory, "queue.sqlite");
  const store = await sqliteTaskQueue(path);
  const server = await serveTaskQueue({ queue: store, token });
  const queue = httpTaskQueue({ url: server.url, token });
  t.after(async () => {
    await server.close();
    store.close();
    await rm(directory, { recursive: true, force: true });
  });
  return { directory, path, store, server, queue };
}
async function until(queue: TaskQueue, id: string, status: QueueJob["status"]) {
  for (let i = 0; i < 300; i++) {
    const job = await queue.get(id);
    if (job?.status === status) return job;
    await delay(10);
  }
  throw new Error(`Timed out waiting for ${status}`);
}
function worker(
  queue: TaskQueue,
  name: string,
  handlers: Record<string, QueueHandler>,
  leaseMs = 30_000,
) {
  const stop = new AbortController();
  const done = runQueueWorker({
    queue,
    worker: name,
    handlers,
    signal: stop.signal,
    leaseMs,
    pollMs: 10,
  });
  return { stop, done };
}

test("HTTP workers claim disjoint jobs and return JSON/usage", async (t) => {
  const { queue } = await fixture(t);
  for (let i = 0; i < 8; i++)
    await queue.enqueue({ id: `job-${i}`, handler: "double", input: i });
  await queue.enqueue({
    id: "unsupported",
    handler: "no-code-upload",
    input: null,
  });
  const seen: string[] = [];
  const owners = new Set<string>();
  const handle: QueueHandler = async (input, { signal, job }) => {
    seen.push(job.id);
    owners.add(job.worker!);
    await delay(750, undefined, { signal });
    return {
      value: Number(input) * 2,
      usage: { input: 1, cached: 0, output: 2 },
    };
  };
  const first = worker(queue, "worker-a", { double: handle });
  const second = worker(queue, "worker-b", { double: handle });
  t.after(async () => {
    first.stop.abort();
    second.stop.abort();
    await Promise.all([first.done, second.done]);
  });
  for (let i = 0; i < 8; i++) {
    const job = await until(queue, `job-${i}`, "done");
    assert.equal(job.result?.value, i * 2);
    assert.equal(job.fence, 1);
  }
  assert.equal(new Set(seen).size, 8);
  assert.equal(seen.length, 8);
  assert.equal(owners.size, 2);
  assert.equal((await queue.get("unsupported"))?.status, "pending");
  first.stop.abort();
  second.stop.abort();
  await Promise.all([first.done, second.done]);
});

test("crashed worker lease expires; restart preserves fences and rejects stale completion/cancellation", async (t) => {
  let now = Date.now();
  t.mock.method(Date, "now", () => now);
  const { queue, path } = await fixture(t);
  const request = { id: "crash", handler: "work", input: null };
  assert.equal((await queue.enqueue(request)).fence, 0);
  assert.equal((await queue.enqueue(request)).fence, 0);
  await assert.rejects(queue.enqueue({ ...request, input: "different" }));
  const first = await queue.claim({
    worker: "dead",
    handlers: ["work"],
    leaseMs: 30,
  });
  assert.ok(first);
  assert.equal(
    await queue.claim({ worker: "other", handlers: ["work"], leaseMs: 30 }),
    undefined,
  );
  now += 31;
  const reopened = await sqliteTaskQueue(path);
  try {
    const second = await reopened.claim({
      worker: "live",
      handlers: ["work"],
      leaseMs: 5000,
    });
    assert.ok(second);
    assert.ok(second.fence > first.fence);
    const stale = { id: first.id, worker: "dead", fence: first.fence };
    await assert.rejects(queue.renew(stale, 300));
    await assert.rejects(queue.complete(stale, { value: "stale" }));
    await assert.rejects(queue.cancel(first.id, first.fence));
    const lease = { id: second.id, worker: "live", fence: second.fence };
    await queue.complete(lease, { value: "accepted" });
    await assert.rejects(queue.complete(lease, { value: "duplicate" }));
    assert.equal((await reopened.get(request.id))?.result?.value, "accepted");
    assert.equal((await queue.cancel(request.id, second.fence)).status, "done");
  } finally {
    reopened.close();
  }
});

test("HTTP authentication, routing, malformed messages and size bounds", async (t) => {
  const { server, queue } = await fixture(t);
  assert.throws(
    () => httpTaskQueue({ url: server.url, token: "short" }),
    /token/,
  );
  assert.throws(
    () => httpTaskQueue({ url: "http://secret:password@localhost", token }),
    /URL/,
  );
  assert.throws(
    () => httpTaskQueue({ url: server.url, token, timeoutMs: 0 }),
    /timeout/,
  );
  assert.equal(
    (await fetch(`${server.url}/queue`, { method: "POST" })).status,
    401,
  );
  const headers = { authorization: `Bearer ${token}` };
  assert.equal((await fetch(`${server.url}/wrong`, { headers })).status, 404);
  for (const body of [
    "{broken",
    "null",
    JSON.stringify({ operation: "unknown" }),
    JSON.stringify({
      operation: "claim",
      request: { worker: "x", handlers: [], leaseMs: -2 },
    }),
    JSON.stringify({ operation: "cancel", id: "missing", fence: 0 }),
  ]) {
    assert.equal(
      (await fetch(`${server.url}/queue`, { method: "POST", headers, body }))
        .status,
      400,
    );
  }
  assert.throws(
    () =>
      queue.enqueue({ id: "huge", handler: "x", input: "x".repeat(600_000) }),
    /size limit/,
  );
  assert.throws(
    () => queue.enqueue({ id: "", handler: "x", input: null }),
    /identifier/,
  );
  assert.equal(await queue.get("absent"), undefined);
});

test("cancellation revokes active worker and deadline survives coordinator reopen", async (t) => {
  const { queue, path } = await fixture(t);
  let aborted = false;
  await queue.enqueue({ id: "cancel", handler: "wait", input: null });
  const running = worker(
    queue,
    "worker",
    {
      wait: async (_, { signal }) => {
        try {
          await delay(10_000, undefined, { signal });
        } catch {
          aborted = true;
        }
        return { value: "must not publish" };
      },
    },
    90,
  );
  const claimed = await until(queue, "cancel", "active");
  const cancelled = await queue.cancel(claimed.id, claimed.fence);
  assert.ok(cancelled.fence > claimed.fence);
  for (let i = 0; i < 100 && !aborted; i++) await delay(10);
  assert.equal(aborted, true);
  assert.equal((await queue.get("cancel"))?.result, undefined);
  running.stop.abort();
  await running.done;
  await queue.enqueue({
    id: "deadline",
    handler: "wait",
    input: null,
    deadline: Date.now() + 30,
  });
  await delay(50);
  const reopened = await sqliteTaskQueue(path);
  assert.equal((await reopened.get("deadline"))?.status, "cancelled");
  reopened.close();
});

test("handler failures are durable results; worker shutdown leaves jobs reclaimable", async (t) => {
  let now = Date.now();
  t.mock.method(Date, "now", () => now);
  const { queue } = await fixture(t);
  await queue.enqueue({ id: "fail", handler: "fail", input: null });
  const running = worker(queue, "one", {
    fail() {
      throw new Error("handler failure");
    },
  });
  assert.equal(
    (await until(queue, "fail", "failed")).result?.error,
    "handler failure",
  );
  running.stop.abort();
  await running.done;
  await queue.enqueue({ id: "shutdown", handler: "stop", input: null });
  const shutdown = worker(
    queue,
    "one",
    {
      stop: async (_, { signal }) => {
        await delay(10_000, undefined, { signal });
        return { value: null };
      },
    },
    90,
  );
  await until(queue, "shutdown", "active");
  shutdown.stop.abort();
  await shutdown.done;
  now += 91;
  assert.ok(
    await queue.claim({
      worker: "replacement",
      handlers: ["stop"],
      leaseMs: 300,
    }),
  );
});

test("queued workflow resumes same logical job after connection loss and reports budget usage", async (t) => {
  const { queue, directory } = await fixture(t);
  let fail = true;
  let calls = 0;
  const interrupted: TaskQueue = {
    ...queue,
    async get(id) {
      if (fail) {
        fail = false;
        throw new Error("lost connection");
      }
      return queue.get(id);
    },
  };
  const remote = queuedTask({
    key: "remote",
    queue: interrupted,
    handler: "double",
    input: () => 4,
    decode: (value) => Number(value),
    pollMs: 10,
  });
  const graph = workflow("remote", [remote]);
  const checkpoint = {
    store: fileWorkflowCheckpointStore({
      directory: join(directory, "checkpoints"),
    }),
    runId: "run",
    version: "1",
  };
  assert.equal((await graph.start({ checkpoint })).status, "failed");
  const running = worker(queue, "worker", {
    double: (input) => {
      calls++;
      return {
        value: Number(input) * 2,
        usage: { input: 3, cached: 0, output: 2 },
      };
    },
  });
  const result = await graph.start({
    checkpoint: { ...checkpoint, resume: "retry-incomplete" },
  });
  result.unwrap();
  assert.equal(result.value(remote), 8);
  assert.equal(result.usage.tokens.input, 3);
  assert.equal(calls, 1);
  running.stop.abort();
  await running.done;
});

test("queued workflow cancellation cancels remote job; terminal failures reach workflow", async (t) => {
  const { queue } = await fixture(t);
  let id = "";
  const observed: TaskQueue = {
    ...queue,
    async enqueue(request) {
      id = request.id;
      return queue.enqueue(request);
    },
  };
  const stop = new AbortController();
  const remote = queuedTask({
    key: "cancel",
    queue: observed,
    handler: "work",
    input: () => null,
    decode: (value) => value,
    pollMs: 10,
  });
  const pending = workflow("cancel", [remote]).start({ signal: stop.signal });
  while (!id) await delay(1);
  stop.abort();
  assert.equal((await pending).status, "cancelled");
  assert.equal((await queue.get(id))?.status, "cancelled");
  const running = worker(queue, "one", {
    work: () => ({
      value: null,
      error: "failed",
      usage: { input: 7, cached: 0, output: 0 },
    }),
  });
  const failure = await workflow("failure", [remote]).start();
  assert.equal(failure.status, "failed");
  assert.equal(failure.usage.tokens.input, 7);
  running.stop.abort();
  await running.done;
});

test("HTTP client rejects untrusted malformed responses and response size overflow", async (t) => {
  let body = JSON.stringify({ status: "invented" });
  const server = createServer((_, response) => {
    response.end(body);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise<void>((resolve) => server.close(() => resolve())));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const queue = httpTaskQueue({
    url: `http://127.0.0.1:${address.port}`,
    token,
  });
  await assert.rejects(queue.get("x"), /status/);
  body = JSON.stringify("x".repeat(1_100_000));
  await assert.rejects(queue.get("x"), /size limit/);
});

test("failed terminal queue usage is counted once across workflow retries and checkpoint resume", async (t) => {
  const { queue, directory } = await fixture(t);
  let calls = 0;
  const running = worker(queue, "worker", {
    fail: () => {
      calls++;
      return {
        value: null,
        error: "terminal",
        usage: { input: 9, cached: 0, output: 1 },
      };
    },
  });
  const remote = queuedTask({
    key: "failed",
    queue,
    handler: "fail",
    input: () => null,
    decode: (value) => value,
    pollMs: 10,
    retry: { attempts: 2 },
  });
  const graph = workflow("failed-usage", [remote]);
  const checkpoint = {
    store: fileWorkflowCheckpointStore({
      directory: join(directory, "checkpoints"),
    }),
    runId: "failure",
    version: "1",
  };
  const initial = await graph.start({ checkpoint });
  assert.equal(initial.status, "failed");
  assert.equal(initial.usage.tokens.input, 9);
  assert.equal(initial.tasks[0]?.usageReceipts?.length, 1);
  const resumed = await graph.start({
    checkpoint: { ...checkpoint, resume: "retry-incomplete" },
  });
  assert.equal(resumed.status, "failed");
  assert.equal(resumed.usage.tokens.input, 9);
  assert.equal(calls, 1);
  running.stop.abort();
  await running.done;
});

test("coordinator closes and reopens with durable job identity and fence", async () => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-queue-restart-"));
  const path = join(directory, "queue.sqlite");
  let store = await sqliteTaskQueue(path);
  let server = await serveTaskQueue({ queue: store, token });
  try {
    let queue = httpTaskQueue({ url: server.url, token });
    const request = { id: "persistent", handler: "work", input: 3 };
    await queue.enqueue(request);
    const claim = await queue.claim({
      worker: "first",
      handlers: ["work"],
      leaseMs: 30,
    });
    assert.ok(claim);
    await server.close();
    store.close();
    await delay(50);
    store = await sqliteTaskQueue(path);
    server = await serveTaskQueue({ queue: store, token });
    queue = httpTaskQueue({ url: server.url, token });
    assert.equal((await queue.enqueue(request)).id, request.id);
    const next = await queue.claim({
      worker: "second",
      handlers: ["work"],
      leaseMs: 1000,
    });
    assert.ok(next);
    assert.equal(next.fence, claim.fence + 1);
  } finally {
    await server.close();
    store.close();
    await rm(directory, { recursive: true, force: true });
  }
});

test("claims select eligible work without deserializing retained terminal payload history", async (t) => {
  const { store, path } = await fixture(t);
  for (let i = 0; i < 50; i++) {
    const id = `history-${i}`;
    await store.enqueue({ id, handler: "work", input: "x".repeat(100_000) });
    const job = await store.claim({
      worker: "initial",
      handlers: ["work"],
      leaseMs: 10_000,
    });
    assert.ok(job);
    await store.complete(
      { id, worker: "initial", fence: job.fence },
      { value: "retained" },
    );
  }
  const { DatabaseSync } = await import("node:sqlite");
  const inspection = new DatabaseSync(path);
  try {
    inspection.exec(
      "UPDATE queue_jobs SET body = 'unreadable historical payload' WHERE status = 'done'",
    );
    await store.enqueue({
      id: "unsupported",
      handler: "elsewhere",
      input: null,
    });
    await store.enqueue({
      id: "expired",
      handler: "work",
      input: null,
      deadline: Date.now() - 1,
    });
    await store.enqueue({ id: "eligible", handler: "work", input: null });
    const selected = await store.claim({
      worker: "next",
      handlers: ["work"],
      leaseMs: 10_000,
    });
    assert.equal(selected?.id, "eligible");
    assert.equal(
      await store.claim({
        worker: "next",
        handlers: ["work"],
        leaseMs: 10_000,
      }),
      undefined,
    );
  } finally {
    inspection.close();
  }
});

test("worker cancellation during claim does not start a newly assigned handler", async (t) => {
  const { queue } = await fixture(t);
  await queue.enqueue({ id: "late-claim", handler: "work", input: null });
  const stop = new AbortController();
  const cancelledClaim: TaskQueue = {
    ...queue,
    async claim(request) {
      const job = await queue.claim(request);
      stop.abort();
      return job;
    },
  };
  await runQueueWorker({
    queue: cancelledClaim,
    worker: "stopped",
    handlers: { work: () => assert.fail("Stopped handler must not start") },
    signal: stop.signal,
  });
  assert.equal((await queue.get("late-claim"))?.status, "active");
});

test("HTTP heartbeat extends ownership beyond the initial expiry before publishing", async (t) => {
  let now = Date.now();
  t.mock.method(Date, "now", () => now);
  const { queue } = await fixture(t);
  await queue.enqueue({ id: "heartbeat", handler: "wait", input: null });
  let release = () => {};
  const renewed = new Promise<void>((resolve) => {
    release = resolve;
  });
  let initialExpiry = 0;
  let renewals = 0;
  const observed: TaskQueue = {
    ...queue,
    async renew(lease, leaseMs) {
      if (!renewals) now = initialExpiry - 1;
      const job = await queue.renew(lease, leaseMs);
      assert.ok(job.expires! > initialExpiry);
      renewals++;
      now = initialExpiry + 1;
      release();
      return job;
    },
  };
  const running = worker(
    observed,
    "renewing",
    {
      async wait(_, { job }) {
        initialExpiry = job.expires!;
        await renewed;
        return { value: "after initial expiry" };
      },
    },
    90,
  );
  try {
    const job = await until(queue, "heartbeat", "done");
    assert.ok(renewals >= 1);
    assert.ok(now > initialExpiry);
    assert.equal(job.fence, 1);
    assert.equal(job.result?.value, "after initial expiry");
  } finally {
    running.stop.abort();
    release();
    await running.done;
  }
});
