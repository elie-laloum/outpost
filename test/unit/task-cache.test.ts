import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agentTask,
  isolatedTask,
  loopTask,
  task,
  workflow,
} from "../../src/index.ts";
import type {
  Sandbox,
  TaskCacheEntry,
  TaskCacheOptions,
  TaskCacheStore,
  WorkflowEvent,
} from "../../src/index.ts";
import { taskCacheFingerprint } from "../../src/domain/workflow/task-cache-entry.ts";

function memory() {
  const entries = new Map<string, TaskCacheEntry>();
  const store: TaskCacheStore = {
    async read(fingerprint) {
      const entry = entries.get(fingerprint);
      return entry === undefined ? undefined : structuredClone(entry);
    },
    async write(entry) {
      entries.set(entry.fingerprint, structuredClone(entry));
    },
  };
  return { store, entries };
}

function outcomes(events: readonly WorkflowEvent[]) {
  return events
    .filter((event) => event.type === "cache")
    .map((event) => [event.key, event.cache]);
}

test("task cache definitions are validated at composition", () => {
  const { store } = memory();
  const valid: TaskCacheOptions = { store, version: "1", key: () => [] };
  const perform = () => 1;
  for (const [cache, pattern] of [
    [{ ...valid, store: {} }, /store and a key/],
    [{ ...valid, key: "fixed" }, /store and a key/],
    [{ ...valid, version: " " }, /version must not be empty/],
    [{ ...valid, maxAgeMs: 0 }, /maxAgeMs must be a positive integer/],
    [{ ...valid, maxAgeMs: 1.5 }, /maxAgeMs must be a positive integer/],
    [{ ...valid, mode: "always" }, /reuse or refresh/],
  ] as const)
    assert.throws(
      () => task({ key: "a", cache: cache as never, perform }),
      pattern,
    );
  assert.throws(
    () =>
      task({
        key: "a",
        cache: valid,
        interaction: { identity: "i", actors: ["alice"] },
        perform,
      }),
    /cannot use a task cache/,
  );
  assert.throws(
    () =>
      task({
        key: "a",
        cache: valid,
        gate: { kind: "approval", prompt: "ok?", actors: ["alice"] },
        perform,
      }),
    /cannot use a task cache/,
  );
  assert.throws(
    () =>
      workflow("gate", [
        {
          ...task({ key: "a", perform }),
          gate: { kind: "approval", prompt: "ok?", actors: ["alice"] },
          cache: valid,
        },
      ]),
    /conditions, retries, timeouts or caches/,
  );
  assert.throws(
    () =>
      workflow("interaction", [
        {
          ...task({ key: "a", perform }),
          interaction: { identity: "i", actors: ["alice"] },
          cache: valid,
        },
      ]),
    /cannot use a task cache/,
  );
  const sandbox = {} as Sandbox;
  assert.throws(
    () =>
      agentTask({
        key: "agent",
        sandbox,
        request: () => ({ brief: { text: "x" } }),
        ...({ cache: valid } as object),
      }),
    /JSON projection/,
  );
  assert.throws(
    () =>
      isolatedTask({
        key: "isolated",
        request: () => ({}) as never,
        ...({ cache: valid } as object),
      }),
    /JSON projection/,
  );
  const cached = task({
    key: "a",
    cache: { ...valid, mode: "refresh" },
    perform,
  });
  assert.ok(Object.isFrozen(cached.cache));
});

test("a miss stores the result and a later hit skips execution, attempts and usage", async () => {
  const { store, entries } = memory();
  let runs = 0;
  const definitions = () => {
    const source = task({ key: "source", perform: () => ({ b: 2, a: 1 }) });
    const review = task({
      key: "review",
      after: [source],
      retry: { attempts: 2 },
      cache: {
        store,
        version: "v1",
        key: (ctx) => ({ source: ctx.value(source), agent: "claude" }),
      },
      perform(ctx) {
        runs++;
        ctx.reportUsage({ input: 3, cached: 0, output: 4 });
        return { verdict: "ok", findings: [1, 2] };
      },
    });
    const after = task({
      key: "after",
      after: [review],
      perform: (ctx) => ctx.value(review).findings.length,
    });
    return {
      review,
      after,
      graph: workflow("cached", [source, review, after]),
    };
  };
  const first = definitions();
  const events: WorkflowEvent[] = [];
  const cold = await first.graph.start({
    observe: (event) => events.push(event),
  });
  cold.unwrap();
  assert.equal(runs, 1);
  assert.deepEqual(outcomes(events), [
    ["review", "miss"],
    ["review", "stored"],
  ]);
  assert.equal(entries.size, 1);
  const [entry] = entries.values();
  assert.equal(entry?.workflow, "cached");
  assert.equal(entry?.task, "review");
  assert.equal(entry?.version, "v1");
  assert.deepEqual(entry?.value, {
    kind: "json",
    value: { verdict: "ok", findings: [1, 2] },
  });

  const second = definitions();
  events.length = 0;
  const warm = await second.graph.start({
    observe: (event) => events.push(event),
  });
  warm.unwrap();
  assert.equal(runs, 1);
  assert.deepEqual(outcomes(events), [["review", "hit"]]);
  assert.equal(
    events.some((event) => event.type === "attempt" && event.key === "review"),
    false,
  );
  assert.deepEqual(warm.value(second.review), {
    verdict: "ok",
    findings: [1, 2],
  });
  assert.equal(warm.value(second.after), 2);
  const record = warm.tasks.find((item) => item.key === "review");
  assert.equal(record?.cacheHit, true);
  assert.equal(record?.attempts, 0);
  assert.equal(record?.status, "done");
  assert.equal(
    cold.tasks.find((item) => item.key === "review")?.cacheHit,
    undefined,
  );
  assert.equal(warm.usage.attempts, 2);
  assert.equal(warm.usage.tokens.input, 0);
});

test("fingerprints canonicalize keys and separate workflows, tasks and versions", async () => {
  const base = taskCacheFingerprint("w", "t", "1", { a: 1, b: [true, null] });
  assert.match(base, /^[0-9a-f]{64}$/);
  assert.equal(
    taskCacheFingerprint("w", "t", "1", { b: [true, null], a: 1 }),
    base,
  );
  for (const other of [
    taskCacheFingerprint("x", "t", "1", { a: 1, b: [true, null] }),
    taskCacheFingerprint("w", "u", "1", { a: 1, b: [true, null] }),
    taskCacheFingerprint("w", "t", "2", { a: 1, b: [true, null] }),
    taskCacheFingerprint("w", "t", "1", { a: 1, b: [null, true] }),
  ])
    assert.notEqual(other, base);
  for (const invalid of [undefined, new Date(), Number.NaN, -0, () => 1])
    assert.throws(
      () => taskCacheFingerprint("w", "t", "1", invalid),
      /Task cache key must be a lossless JSON value/,
    );

  const { store } = memory();
  let runs = 0;
  const run = async (name: string, version: string, key: unknown) => {
    const item = task({
      key: "t",
      cache: { store, version, key: () => key as never },
      perform: () => ++runs,
    });
    const result = await workflow(name, [item]).start();
    result.unwrap();
    return result.value(item);
  };
  assert.equal(await run("w", "1", { a: 1, b: 2 }), 1);
  assert.equal(await run("w", "1", { b: 2, a: 1 }), 1);
  assert.equal(await run("w", "2", { a: 1, b: 2 }), 2);
  assert.equal(await run("other", "1", { a: 1, b: 2 }), 3);
});

test("expired entries and refresh mode execute again and replace the entry", async () => {
  const { store, entries } = memory();
  let runs = 0;
  const run = async (options: Partial<TaskCacheOptions>) => {
    const events: WorkflowEvent[] = [];
    const item = task({
      key: "t",
      cache: { store, version: "1", key: () => "k", ...options },
      perform: () => ++runs,
    });
    const result = await workflow("w", [item]).start({
      observe: (event) => events.push(event),
    });
    result.unwrap();
    return { value: result.value(item), events: outcomes(events) };
  };
  assert.equal((await run({ maxAgeMs: 60_000 })).value, 1);
  assert.equal((await run({ maxAgeMs: 60_000 })).value, 1);
  const [fingerprint, entry] = [...entries][0]!;
  entries.set(fingerprint, {
    ...entry,
    createdAt: new Date(Date.now() - 120_000).toISOString(),
  });
  const expired = await run({ maxAgeMs: 60_000 });
  assert.equal(expired.value, 2);
  assert.deepEqual(expired.events, [
    ["t", "miss"],
    ["t", "stored"],
  ]);
  assert.equal((await run({})).value, 2);
  const refreshed = await run({ mode: "refresh" });
  assert.equal(refreshed.value, 3);
  assert.deepEqual(refreshed.events, [
    ["t", "miss"],
    ["t", "stored"],
  ]);
  assert.equal((await run({})).value, 3);
});

test("undefined results are cached and restored", async () => {
  const { store } = memory();
  let runs = 0;
  const run = async () => {
    const item = task({
      key: "t",
      cache: { store, version: "1", key: () => null },
      perform: () => {
        runs++;
      },
    });
    const result = await workflow("w", [item]).start();
    result.unwrap();
    return result;
  };
  await run();
  const warm = await run();
  assert.equal(runs, 1);
  assert.equal(warm.tasks[0]?.cacheHit, true);
});

test("non-JSON results and key errors fail the task without storing", async () => {
  const { store, entries } = memory();
  let runs = 0;
  const output = task({
    key: "output",
    retry: { attempts: 3 },
    cache: { store, version: "1", key: () => "k" },
    perform: () => {
      runs++;
      return { at: new Date() };
    },
  });
  const failed = await workflow("w", [output]).start();
  assert.equal(failed.status, "failed");
  assert.equal(runs, 1);
  assert.match(
    String(failed.tasks[0]?.error),
    /Cached task results must be lossless JSON.*plain JSON objects/,
  );
  assert.equal(entries.size, 0);

  for (const key of [
    () => {
      throw new Error("no head");
    },
    () => undefined as never,
  ]) {
    const item = task({
      key: "keyed",
      cache: { store, version: "1", key },
      perform: () => ++runs,
    });
    const result = await workflow("w", [item]).start();
    assert.equal(result.status, "failed");
    assert.match(String(result.tasks[0]?.error), /no head|lossless JSON/);
  }
  assert.equal(runs, 1);
});

test("store failures and invalid entries never change the task outcome", async () => {
  let runs = 0;
  const failing: TaskCacheStore = {
    read: () => Promise.reject(new Error("store offline")),
    write: () => Promise.reject(new Error("store read-only")),
  };
  const events: WorkflowEvent[] = [];
  const item = task({
    key: "t",
    cache: { store: failing, version: "1", key: () => "k" },
    perform: () => ++runs,
  });
  const result = await workflow("w", [item]).start({
    observe: (event) => events.push(event),
  });
  result.unwrap();
  assert.equal(result.value(item), 1);
  assert.deepEqual(
    events
      .filter((event) => event.type === "cache")
      .map((event) => [event.cache, event.error]),
    [
      ["failed", "store offline"],
      ["failed", "store read-only"],
    ],
  );

  const { store, entries } = memory();
  const wrong: TaskCacheStore = {
    async read() {
      return {
        format: 1,
        fingerprint: "0".repeat(64),
        workflow: "w",
        task: "t",
        version: "1",
        createdAt: new Date().toISOString(),
        value: { kind: "json", value: "poisoned" },
      };
    },
    write: store.write,
  };
  events.length = 0;
  const guarded = task({
    key: "t",
    cache: { store: wrong, version: "1", key: () => "k" },
    perform: () => "fresh",
  });
  const fresh = await workflow("w", [guarded]).start({
    observe: (event) => events.push(event),
  });
  fresh.unwrap();
  assert.equal(fresh.value(guarded), "fresh");
  assert.deepEqual(outcomes(events), [
    ["t", "failed"],
    ["t", "stored"],
  ]);
  assert.equal(entries.size, 1);
});

test("observer failures do not affect cached execution", async () => {
  const { store } = memory();
  const item = task({
    key: "t",
    cache: { store, version: "1", key: () => "k" },
    perform: () => "value",
  });
  const observed = {
    observe: () => {
      throw new Error("observer");
    },
  };
  const cold = await workflow("w", [item]).start(observed);
  cold.unwrap();
  const warm = await workflow("w", [item]).start(observed);
  warm.unwrap();
  assert.equal(warm.tasks[0]?.cacheHit, true);
});

test("cancellation during lookup cancels the task", async () => {
  const controller = new AbortController();
  const store: TaskCacheStore = {
    async read() {
      controller.abort(new Error("stop"));
      throw new Error("aborted read");
    },
    async write() {},
  };
  let runs = 0;
  const item = task({
    key: "t",
    cache: { store, version: "1", key: () => "k" },
    perform: () => ++runs,
  });
  const result = await workflow("w", [item]).start({
    signal: controller.signal,
  });
  assert.equal(result.status, "cancelled");
  assert.equal(runs, 0);
});

test("zero-delay retries still retry with a cache", async () => {
  const { store } = memory();
  let runs = 0;
  const item = task({
    key: "t",
    retry: { attempts: 3 },
    cache: { store, version: "1", key: () => "k" },
    perform: () => {
      if (++runs < 3) throw new Error("again");
      return runs;
    },
  });
  const result = await workflow("w", [item]).start();
  result.unwrap();
  assert.equal(result.value(item), 3);
  assert.equal(result.tasks[0]?.attempts, 3);
});

test("loop tasks cache their accepted result", async () => {
  const { store } = memory();
  let rounds = 0;
  const definition = () =>
    loopTask({
      key: "fix",
      maxRounds: 3,
      cache: { store, version: "1", key: () => "fix" },
      attempt: (ctx) => {
        rounds++;
        return ctx.round;
      },
      check: (_, value) =>
        value === 2 ? { done: true } : { done: false, feedback: "again" },
    });
  const first = definition();
  const cold = await workflow("loop", [first]).start();
  cold.unwrap();
  assert.equal(cold.value(first), 2);
  assert.equal(rounds, 2);
  const second = definition();
  const warm = await workflow("loop", [second]).start();
  warm.unwrap();
  assert.equal(warm.value(second), 2);
  assert.equal(rounds, 2);
  assert.equal(warm.tasks[0]?.rounds, undefined);
  assert.equal(warm.tasks[0]?.cacheHit, true);
});
