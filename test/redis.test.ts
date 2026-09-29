import { verifyProcessRecovery } from "./fixtures/queue-process-recovery.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { randomUUID, createHash } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { Queue, Job } from "bullmq";
import { createBullMQTaskQueue } from "../src/infrastructure/task-queue-bullmq.ts";
import {
  defineQueuedTask,
  runQueueWorker,
  defineWorkflow,
} from "../src/index.ts";
import type { QueueJob, TaskQueue } from "../src/index.ts";

const connection = {
  host: "127.0.0.1",
  port: Number(process.env.OUTPOST_REDIS_PORT ?? 6379),
};
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
async function fixture(t: TestContext) {
  const errors: Error[] = [];
  const options = {
    name: "test",
    prefix: `outpost-test-${randomUUID()}`,
    connection,
    stalledIntervalMs: 50,
    onError(error: Error) {
      errors.push(error);
      throw new Error("observer failure");
    },
  };
  const first = await createBullMQTaskQueue(options);
  const second = await createBullMQTaskQueue(options);
  const inspector = new Queue(`${hash(options.name)}-${hash("work")}`, {
    connection,
    prefix: options.prefix,
  });
  t.after(async () => {
    await Promise.all([first.close(), second.close()]);
    const client = await inspector.client;
    client.defineCommand("clearTestQueue", {
      numberOfKeys: 0,
      lua: "local keys = redis.call('KEYS', ARGV[1]); for _, key in ipairs(keys) do redis.call('DEL', key) end; return #keys",
    });
    await client.runCommand("clearTestQueue", [`${options.prefix}:*`]);
    await inspector.close();
  });
  return { first, second, options, inspector, errors };
}
async function claim(queue: TaskQueue, worker = "worker", leaseMs = 5000) {
  return queue.claim({ worker, handlers: ["work"], leaseMs });
}
function lease(job: QueueJob) {
  return { id: job.id, worker: job.worker!, fence: job.fence };
}
async function eventually<T>(
  operation: () => Promise<T | undefined>,
  timeoutMs = 5000,
): Promise<T> {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const value = await operation();
    if (value !== undefined) return value;
    await delay(20);
  }
  throw new Error("Timed out waiting for Redis queue");
}

test("BullMQ preserves lossless JSON, identity, native completion and retained results", async (t) => {
  const { first, second, inspector } = await fixture(t);
  const input = {
    precise: 1.2345678901234567,
    large: Number.MAX_SAFE_INTEGER,
    empty: [],
    object: {},
    nil: null,
    unicode: "é🙂",
  };
  const request = { id: "job:with:colons", handler: "work", input };
  const jobs = await Promise.all([
    first.enqueue(request),
    second.enqueue(request),
  ]);
  assert.deepEqual(jobs[0], jobs[1]);
  await assert.rejects(
    first.enqueue({ ...request, input: false }),
    /different request/,
  );
  await assert.rejects(
    first.enqueue({ ...request, handler: "other" }),
    /different request/,
  );
  const job = await claim(first);
  assert.ok(job);
  assert.deepEqual(JSON.parse(JSON.stringify(job.input)), input);
  const result = {
    value: input,
    usage: { input: 2, cached: 3, output: 5, cacheCreated: 7 },
  };
  await second.renew(lease(job), 5000);
  assert.deepEqual(
    JSON.parse(
      JSON.stringify((await second.complete(lease(job), result)).result),
    ),
    result,
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify((await first.get(job.id))?.result)),
    result,
  );
  assert.equal((await first.enqueue(request)).status, "done");
  assert.equal(
    (await inspector.getJob(hash(job.id)))?.returnvalue.value.precise,
    input.precise,
  );
  assert.equal(
    await (await inspector.getJob(hash(job.id)))?.getState(),
    "completed",
  );
  await assert.rejects(first.complete(lease(job), result), /Stale queue lease/);
  assert.equal((await first.cancel(job.id, job.fence)).status, "done");
  assert.equal(await first.get("absent"), undefined);
});

test("BullMQ concurrent claims are disjoint and only select supported handlers", async (t) => {
  const { first, second } = await fixture(t);
  await first.enqueue({ id: "unsupported", handler: "other", input: null });
  for (let i = 0; i < 8; i++)
    await first.enqueue({ id: `job-${i}`, handler: "work", input: i });
  const jobs = await Promise.all(
    Array.from({ length: 8 }, (_, i) =>
      claim(i % 2 ? first : second, `worker-${i}`),
    ),
  );
  assert.equal(new Set(jobs.map((job) => job?.id)).size, 8);
  assert.ok(jobs.every((job) => job?.handler === "work"));
  assert.equal(await claim(first), undefined);
  assert.equal((await first.get("unsupported"))?.status, "pending");
});

test("BullMQ reclaims crashed workers repeatedly and fences every stale operation after reopen", async (t) => {
  const { first, second, options } = await fixture(t);
  await first.enqueue({ id: "crash", handler: "work", input: null });
  const initial = await claim(first, "dead", 60);
  assert.ok(initial);
  await first.close();
  await delay(100);
  const replacement = await eventually(() => claim(second, "replacement", 80));
  assert.equal(replacement.fence, initial.fence + 1);
  await assert.rejects(second.renew(lease(initial), 1000), /Stale queue lease/);
  await assert.rejects(
    second.complete(lease(initial), { value: "stale" }),
    /Stale queue lease/,
  );
  await assert.rejects(
    second.cancel(initial.id, initial.fence),
    /Stale queue fence/,
  );
  await delay(120);
  const reopened = await createBullMQTaskQueue(options);
  try {
    const next = await eventually(() => claim(reopened, "third"));
    assert.equal(next.fence, replacement.fence + 1);
    await reopened.complete(lease(next), { value: "accepted" });
    assert.equal((await second.get(next.id))?.result?.value, "accepted");
  } finally {
    await reopened.close();
  }
  await assert.rejects(first.get("crash"), /closed/);
});

test("BullMQ renewals protect ownership beyond the initial expiry", async (t) => {
  const { first, second } = await fixture(t);
  await first.enqueue({ id: "renew", handler: "work", input: null });
  const job = await claim(first, "live", 200);
  assert.ok(job);
  await delay(80);
  const extended = await second.renew(lease(job), 2000);
  assert.ok(extended.expires! > job.expires!);
  await delay(200);
  assert.equal(await claim(second), undefined);
  await first.complete(lease(job), { value: "renewed" });
});

test("BullMQ cancellation, deadlines and completion race atomically", async (t) => {
  const { first, second } = await fixture(t);
  await first.enqueue({ id: "pending", handler: "work", input: null });
  assert.equal((await second.cancel("pending", 0)).status, "cancelled");
  assert.equal(await claim(first), undefined);
  await first.enqueue({
    id: "expired",
    handler: "work",
    input: null,
    deadline: Date.now() - 1,
  });
  assert.equal((await first.get("expired"))?.status, "cancelled");
  assert.equal(await claim(first), undefined);
  await first.enqueue({
    id: "deadline",
    handler: "work",
    input: null,
    deadline: Date.now() + 200,
  });
  const expiring = await claim(first);
  assert.ok(expiring);
  assert.ok(expiring.expires! <= expiring.deadline!);
  await delay(220);
  await assert.rejects(
    second.complete(lease(expiring), { value: "late" }),
    /Stale queue lease/,
  );
  assert.equal((await first.get(expiring.id))?.status, "cancelled");
  await first.enqueue({ id: "race", handler: "work", input: null });
  const job = await claim(first);
  assert.ok(job);
  await Promise.allSettled([
    first.complete(lease(job), { value: "accepted" }),
    second.cancel(job.id, job.fence),
  ]);
  const final = await first.get(job.id);
  assert.ok(final);
  assert.ok(final.status === "done" || final.status === "cancelled");
  assert.equal(
    final.result?.value,
    final.status === "done" ? "accepted" : undefined,
  );
  await assert.rejects(first.renew(lease(job), 1000), /Stale queue lease/);
  await assert.rejects(first.cancel("missing", 0), /does not exist/);
});

test("BullMQ repairs interrupted enqueue and never reruns a durably completed job after native finalization fails", async (t) => {
  const { first, second, inspector, errors } = await fixture(t);
  const request = { id: "interrupted", handler: "work", input: null };
  const original = Queue.prototype.add;
  t.mock.method(
    Queue.prototype,
    "add",
    async () => {
      throw new Error("publish interrupted");
    },
    { times: 1 },
  );
  await assert.rejects(first.enqueue(request), /publish interrupted/);
  Queue.prototype.add = original;
  await second.enqueue(request);
  const job = await claim(first, "first", 100);
  assert.ok(job);
  const complete = Job.prototype.moveToCompleted;
  t.mock.method(
    Job.prototype,
    "moveToCompleted",
    async () => {
      throw new Error("finalization interrupted");
    },
    { times: 1 },
  );
  await first.complete(lease(job), { value: "durable" });
  Job.prototype.moveToCompleted = complete;
  await delay(250);
  await eventually(async () => {
    assert.equal(await claim(second), undefined);
    return (await (await inspector.getJob(hash(job.id)))?.getState()) ===
      "completed"
      ? true
      : undefined;
  });
  assert.ok(
    errors.some((error) => error.message === "finalization interrupted"),
  );
  assert.equal((await second.get(job.id))?.result?.value, "durable");
});

test("BullMQ works with defineQueuedTask and runQueueWorker including failures, usage and cancellation", async (t) => {
  const { first, second } = await fixture(t);
  const stop = new AbortController();
  let aborted = false;
  const running = runQueueWorker({
    queue: second,
    worker: "worker",
    leaseMs: 150,
    pollMs: 10,
    signal: stop.signal,
    handlers: {
      work(input) {
        return { value: input, usage: { input: 4, output: 2, cached: 0 } };
      },
      fail() {
        throw new Error("handler failure");
      },
      async wait(_, { signal }) {
        try {
          await delay(10000, undefined, { signal });
        } catch {
          aborted = true;
        }
        return { value: null };
      },
    },
  });
  try {
    const remote = defineQueuedTask({
      key: "remote",
      queue: first,
      handler: "work",
      input: () => 42,
      decode: Number,
      pollMs: 10,
    });
    const result = await defineWorkflow("redis", [remote]).start({
      signal: AbortSignal.timeout(5000),
    });
    result.unwrap();
    assert.equal(result.value(remote), 42);
    assert.equal(result.usage.tokens.input, 4);
    await first.enqueue({ id: "failed", handler: "fail", input: null });
    const failed = await eventually(async () => {
      const job = await first.get("failed");
      return job?.status === "failed" ? job : undefined;
    });
    assert.equal(failed.result?.error, "handler failure");
    await first.enqueue({ id: "cancel", handler: "wait", input: null });
    const active = await eventually(async () => {
      const job = await first.get("cancel");
      return job?.status === "active" ? job : undefined;
    });
    await first.cancel(active.id, active.fence);
    await eventually(async () => (aborted ? true : undefined));
    assert.equal((await first.get(active.id))?.result, undefined);
  } finally {
    stop.abort();
    await running;
  }
});

test("BullMQ rejects failed authentication and closes its initial connection", async () => {
  await assert.rejects(
    createBullMQTaskQueue({
      name: `invalid-auth-${randomUUID()}`,
      connection: {
        ...connection,
        username: "nonexistent-outpost-test-user",
        password: "invalid-test-password",
        retryStrategy: () => null,
      },
      onError() {
        throw new Error("observer must be isolated");
      },
    }),
    /AUTH|WRONGPASS|password/,
  );
});

test("BullMQ close waits for admitted publication and is idempotent", async (t) => {
  const { first, second } = await fixture(t);
  const publish = Queue.prototype.add;
  let release = () => {};
  let entered = () => {};
  const ready = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  t.mock.method(
    Queue.prototype,
    "add",
    async function (this: Queue, ...args: Parameters<Queue["add"]>) {
      entered();
      await gate;
      return publish.apply(this, args);
    },
    { times: 1 },
  );
  const request = { id: "closing", handler: "work", input: null };
  const enqueue = first.enqueue(request);
  try {
    await ready;
    const closing = first.close();
    assert.equal(first.close(), closing);
    await assert.rejects(first.get(request.id), /closed/);
    release();
    await enqueue;
    await closing;
    assert.equal((await second.get(request.id))?.status, "pending");
    assert.ok(await claim(second));
  } finally {
    release();
    await enqueue;
  }
});

test("BullMQ refuses eviction policies that can discard queue locks", async () => {
  const inspector = new Queue(`policy-${randomUUID()}`, { connection });
  const client = await inspector.client;
  try {
    await client.runCommand("config", [
      "SET",
      "maxmemory-policy",
      "volatile-lru",
    ]);
    await assert.rejects(
      createBullMQTaskQueue({ name: "unsafe-policy", connection }),
      /maxmemory-policy must be noeviction/,
    );
  } finally {
    await client.runCommand("config", [
      "SET",
      "maxmemory-policy",
      "noeviction",
    ]);
    await inspector.close();
  }
});

test(
  "Redis process crash after an external effect resumes with persistent deduplication",
  { timeout: 15000 },
  async (t) => {
    const { first, options } = await fixture(t);
    const { onError, ...configuration } = options;
    await verifyProcessRecovery(t, first, "redis", configuration);
  },
);

test("BullMQ preserves effect keys and quota results", async (t) => {
  const { first } = await fixture(t);
  await first.enqueue({
    id: "resumed:quota:2",
    idempotencyKey: "resumed",
    handler: "work",
    input: null,
  });
  const job = await eventually(() => claim(first));
  assert.equal(job.idempotencyKey, "resumed");
  await first.complete(lease(job), {
    value: null,
    error: "usage limit",
    quota: { resetAt: "2026-09-28T18:00:00.000Z", conversation: "c" },
  });
  const stored = await first.get("resumed:quota:2");
  assert.equal(stored?.status, "failed");
  assert.equal(
    JSON.stringify(stored?.result?.quota),
    '{"resetAt":"2026-09-28T18:00:00.000Z","conversation":"c"}',
  );
});
