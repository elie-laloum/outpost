import assert from "node:assert/strict";
import { test } from "node:test";
import timers from "node:timers/promises";
import { setTimeout as delay } from "node:timers/promises";
import { task, workflow, OutpostError } from "../../src/index.ts";
import { retryDelay, waitForRetry } from "../../src/domain/workflow/retry.ts";
import { maxTimerMs } from "../../src/domain/workflow/retry.constants.ts";

test("retry delay preserves defaults and caps exponential growth before full jitter", () => {
  assert.equal(retryDelay(undefined, 1, null), 0);
  assert.equal(retryDelay({ attempts: 4, delayMs: 100 }, 4, null), 100);
  const retry = {
    attempts: 10,
    delayMs: 100,
    backoff: "exponential",
    maxDelayMs: 350,
  } as const;
  assert.deepEqual(
    [1, 2, 3, 4].map((cycle) => retryDelay(retry, cycle, null)),
    [100, 200, 350, 350],
  );
  assert.equal(
    retryDelay({ ...retry, jitter: "full" }, 4, null, () => 0.5),
    175,
  );
  assert.equal(
    retryDelay({ ...retry, jitter: "full" }, 4, null, () => 0),
    0,
  );
  assert.equal(
    retryDelay(
      { attempts: 2, delayMs: 100, backoff: "exponential" },
      10000,
      null,
    ),
    30000,
  );
  assert.equal(
    retryDelay({ attempts: 2, backoff: "exponential" }, 10000, null),
    0,
  );
});

test("server retry delay is a minimum beyond the local cap and jitter", () => {
  const retry = {
    attempts: 3,
    delayMs: 100,
    maxDelayMs: 50,
    jitter: "full",
  } as const;
  const error = new OutpostError("provider", "busy", { retryAfterMs: 2000 });
  assert.equal(
    retryDelay(retry, 1, error, () => 0),
    2000,
  );
  for (const retryAfterMs of [-1, Infinity, NaN, "100", Number.MAX_VALUE])
    assert.equal(
      retryDelay(
        retry,
        1,
        new OutpostError("provider", "busy", { retryAfterMs }),
        () => 1,
      ),
      50,
    );
});

test("retry waits beyond the timer range are chunked and cancellable", async (t) => {
  const durations: number[] = [];
  const timer = t.mock.method(
    timers,
    "setTimeout",
    async (duration: number) => {
      durations.push(duration);
    },
  );
  const stop = new AbortController();
  await waitForRetry(maxTimerMs + 100, stop.signal);
  assert.deepEqual(durations, [maxTimerMs, 100]);
  timer.mock.restore();
  const cancelled = waitForRetry(Number.MAX_SAFE_INTEGER, stop.signal);
  stop.abort(new Error("stop"));
  await assert.rejects(cancelled, { name: "AbortError" });
  await assert.rejects(waitForRetry(0, stop.signal), /stop/);
});

test("retry configuration rejects invalid delays and strategy values", () => {
  for (const value of [-1, NaN, Infinity, Number.MAX_VALUE]) {
    assert.throws(() =>
      task({
        key: "bad",
        perform() {},
        retry: { attempts: 2, delayMs: value },
      }),
    );
    assert.throws(() =>
      task({
        key: "bad",
        perform() {},
        retry: { attempts: 2, maxDelayMs: value },
      }),
    );
  }
  assert.throws(() =>
    task({
      key: "bad",
      perform() {},
      // @ts-expect-error Validate JavaScript callers too.
      retry: { attempts: 2, backoff: "linear" },
    }),
  );
  assert.throws(() =>
    // @ts-expect-error Validate JavaScript callers too.
    task({ key: "bad", perform() {}, retry: { attempts: 2, jitter: true } }),
  );
  assert.throws(() =>
    task({ key: "bad", perform() {}, timeoutMs: maxTimerMs + 1 }),
  );
});

test("workflow retry events expose the selected server minimum", async () => {
  const delays: (number | undefined)[] = [];
  const item = task({
    key: "retry",
    retry: { attempts: 3, delayMs: 1, backoff: "exponential" },
    perform({ attempt }) {
      if (attempt < 3)
        throw new OutpostError("provider", "busy", { retryAfterMs: 5 });
      return "ok";
    },
  });
  const result = await workflow("retry", [item]).start({
    observe(event) {
      if (event.type === "retry") delays.push(event.delayMs);
    },
  });
  result.unwrap();
  assert.deepEqual(delays, [5, 5]);
  assert.equal(result.value(item), "ok");
});

test("global timeout interrupts a server retry wait without another attempt", async () => {
  const item = task({
    key: "busy",
    retry: { attempts: 10 },
    perform() {
      throw new OutpostError("provider", "busy", {
        retryAfterMs: Number.MAX_SAFE_INTEGER,
      });
    },
  });
  const result = await workflow("deadline", [item]).start({ timeoutMs: 30 });
  assert.equal(result.status, "failed");
  assert.equal(result.tasks[0]?.attempts, 1);
  assert.equal(result.tasks[0]?.status, "cancelled");
  assert.equal(result.errors.length, 1);
  assert.ok(result.errors[0] instanceof OutpostError);
  assert.equal(result.errors[0].code, "timeout");
  assert.throws(() => result.unwrap(), { cause: result.errors[0] });
});

test("global timeout cancels parallel tasks, waits for cleanup and rejects late values", async () => {
  const cleaned: string[] = [];
  const items = ["one", "two"].map((key) =>
    task({
      key,
      async perform({ signal }) {
        try {
          await delay(10000, undefined, { signal });
        } catch {
          return "late";
        } finally {
          await delay(5);
          cleaned.push(key);
        }
      },
    }),
  );
  const after = task({
    key: "after",
    after: items,
    perform() {
      assert.fail("must not run");
    },
  });
  const result = await workflow("deadline", [...items, after]).start({
    concurrency: 2,
    timeoutMs: 30,
    stopOnError: false,
  });
  assert.equal(result.status, "failed");
  assert.deepEqual(cleaned.sort(), ["one", "two"]);
  assert.ok(result.tasks.every((record) => record.status === "cancelled"));
  assert.equal(result.tasks[2]?.attempts, 0);
  for (const item of items) assert.throws(() => result.value(item));
});

test("external cancellation remains cancelled even when cleanup outlasts the deadline", async () => {
  const stop = new AbortController();
  const reason = new Error("caller stopped");
  const item = task({
    key: "one",
    async perform() {
      stop.abort(reason);
      await delay(40);
      return 1;
    },
  });
  const result = await workflow("cancel", [item]).start({
    signal: stop.signal,
    timeoutMs: 10,
  });
  assert.equal(result.status, "cancelled");
  assert.deepEqual(result.errors, [reason]);
  assert.throws(() => result.value(item));
});

test("global timeout includes conditions and rejects invalid timer ranges before work", async () => {
  const item = task({
    key: "condition",
    async condition({ signal }) {
      await delay(10000, undefined, { signal });
      return true;
    },
    perform() {
      assert.fail();
    },
  });
  const result = await workflow("condition", [item]).start({ timeoutMs: 10 });
  assert.equal(result.status, "failed");
  assert.equal(result.tasks[0]?.attempts, 0);
  for (const timeoutMs of [0, -1, 1.5, NaN, Infinity, maxTimerMs + 1])
    await assert.rejects(
      workflow("invalid", [item]).start({ timeoutMs }),
      /timeoutMs/,
    );
  const success = await workflow("empty", []).start({ timeoutMs: 1000 });
  success.unwrap();
});
