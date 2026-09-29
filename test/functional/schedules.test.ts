import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  cronSchedule,
  runSchedules,
  createSqliteTaskQueue,
} from "../../src/index.ts";
import { runSchedulesWithClock } from "../../src/application/schedules.ts";
import type {
  QueueRequest,
  RunSchedulesOptions,
  TaskQueue,
} from "../../src/index.ts";
import type { ScheduleClock } from "../../src/application/schedules.types.ts";

/** SQLite decodes JSON into null-prototype objects. */
const plain = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

async function sqliteQueue(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-schedules-"));
  const queue = await createSqliteTaskQueue(join(directory, "queue.sqlite"));
  t.after(async () => {
    queue.close();
    await rm(directory, { recursive: true, force: true });
  });
  return queue;
}

/** Virtual timers wake in order; a wake-up after `limit` stops the run. */
function virtualClock(start: string, limit: string, stop: AbortController) {
  let now = Date.parse(start);
  const end = Date.parse(limit);
  const sleepers: {
    wake: number;
    resolve: () => void;
    reject: (reason: unknown) => void;
  }[] = [];
  let driving = false;
  function drive() {
    driving = false;
    sleepers.sort((left, right) => left.wake - right.wake);
    const first = sleepers[0];
    if (!first) return;
    if (first.wake > end) {
      stop.abort();
      for (const sleeper of sleepers.splice(0))
        sleeper.reject(stop.signal.reason);
      return;
    }
    sleepers.shift();
    now = Math.max(now, first.wake);
    first.resolve();
    schedule();
  }
  function schedule() {
    if (driving) return;
    driving = true;
    setTimeout(drive, 5);
  }
  const clock: ScheduleClock = {
    now: () => now,
    sleep(ms, signal) {
      return new Promise<void>((resolve, reject) => {
        signal.throwIfAborted();
        const sleeper = { wake: now + ms, resolve, reject };
        sleepers.push(sleeper);
        signal.addEventListener("abort", () => {
          const index = sleepers.indexOf(sleeper);
          if (index >= 0) sleepers.splice(index, 1);
          reject(signal.reason);
        });
        schedule();
      });
    },
  };
  return {
    clock,
    advance(ms: number) {
      now += ms;
    },
  };
}

function recordingQueue(onEnqueue?: (request: QueueRequest) => void) {
  const requests: QueueRequest[] = [];
  const queue = {
    async enqueue(request: QueueRequest) {
      onEnqueue?.(request);
      requests.push(request);
      return { ...request, status: "pending" as const, fence: 0 };
    },
  } as unknown as TaskQueue;
  return { queue, requests };
}

test("schedules publish one trigger job per slot with derived identities", async (t) => {
  const queue = await sqliteQueue(t);
  const stop = new AbortController();
  const { clock } = virtualClock(
    "2026-09-29T09:59:30Z",
    "2026-09-29T12:00:30Z",
    stop,
  );
  await runSchedulesWithClock(
    {
      queue,
      signal: stop.signal,
      schedules: [
        {
          name: "hourly",
          cron: cronSchedule("0 * * * *"),
          handler: "audit",
        },
        {
          name: "report",
          cron: cronSchedule("30 10 * * *"),
          handler: "report",
          runId: (slot) => `report-${slot.toISOString().slice(0, 10)}`,
          input: (slot) => ({ day: slot.toISOString().slice(0, 10) }),
        },
      ],
    },
    clock,
  );
  const hourly = await queue.get("schedule:hourly:2026-09-29T11:00:00.000Z");
  assert.deepEqual(
    plain(hourly && { handler: hourly.handler, input: hourly.input }),
    {
      handler: "audit",
      input: { runId: "hourly:2026-09-29T11:00:00.000Z", input: null },
    },
  );
  for (const hour of ["10", "11", "12"])
    assert.ok(await queue.get(`schedule:hourly:2026-09-29T${hour}:00:00.000Z`));
  assert.equal(
    await queue.get("schedule:hourly:2026-09-29T09:00:00.000Z"),
    undefined,
    "a slot older than maxLateMs is not caught up",
  );
  assert.deepEqual(
    plain((await queue.get("schedule:report:2026-09-29T10:30:00.000Z"))?.input),
    { runId: "report-2026-09-29", input: { day: "2026-09-29" } },
  );
});

test("concurrent schedulers converge on the same queue job", async (t) => {
  const queue = await sqliteQueue(t);
  const schedules = [
    { name: "nightly", cron: cronSchedule("0 2 * * *"), handler: "audit" },
  ];
  for (let replica = 0; replica < 2; replica++) {
    const stop = new AbortController();
    const { clock } = virtualClock(
      "2026-09-29T01:59:59Z",
      "2026-09-29T02:00:01Z",
      stop,
    );
    await runSchedulesWithClock(
      { queue, schedules, signal: stop.signal },
      clock,
    );
  }
  const job = await queue.get("schedule:nightly:2026-09-29T02:00:00.000Z");
  assert.equal(job?.status, "pending");
  assert.equal(
    await queue
      .claim({ worker: "w", handlers: ["audit"], leaseMs: 1_000 })
      .then((claimed) => claimed?.id),
    job?.id,
  );
  assert.equal(
    await queue.claim({ worker: "w", handlers: ["audit"], leaseMs: 1_000 }),
    undefined,
    "the second replica did not add a job",
  );
});

test("a restart catches up only the latest slot within maxLateMs", async () => {
  const run = async (start: string, maxLateMs?: number) => {
    const stop = new AbortController();
    const { clock } = virtualClock(start, start, stop);
    const { queue, requests } = recordingQueue();
    await runSchedulesWithClock(
      {
        queue,
        signal: stop.signal,
        ...(maxLateMs === undefined ? {} : { maxLateMs }),
        schedules: [
          {
            name: "minutely",
            cron: cronSchedule("* * * * *"),
            handler: "tick",
          },
        ],
      },
      clock,
    );
    return requests.map((request) => request.id);
  };
  assert.deepEqual(await run("2026-09-29T10:00:45Z"), [
    "schedule:minutely:2026-09-29T10:00:00.000Z",
  ]);
  assert.deepEqual(await run("2026-09-29T10:00:45Z", 30_000), []);
  assert.deepEqual(await run("2026-09-29T10:05:10Z", 600_000), [
    "schedule:minutely:2026-09-29T10:05:00.000Z",
  ]);
});

test("a late wake-up publishes only the latest missed slot", async () => {
  const stop = new AbortController();
  const time = virtualClock(
    "2026-09-29T10:00:30Z",
    "2026-09-29T10:09:30Z",
    stop,
  );
  let suspended = false;
  const { queue, requests } = recordingQueue(() => {
    if (suspended) return;
    suspended = true;
    time.advance(5 * 60_000);
  });
  await runSchedulesWithClock(
    {
      queue,
      signal: stop.signal,
      maxLateMs: 10_000,
      schedules: [
        { name: "tick", cron: cronSchedule("* * * * *"), handler: "tick" },
      ],
    },
    time.clock,
  );
  assert.deepEqual(
    requests.map((request) => request.id.slice(-24, -8)),
    [
      "2026-09-29T10:01",
      "2026-09-29T10:06",
      "2026-09-29T10:07",
      "2026-09-29T10:08",
      "2026-09-29T10:09",
    ],
  );
});

test("publication failures reject by default or reach onError", async () => {
  const failing = recordingQueue(() => {
    throw new Error("queue unavailable");
  });
  const options = (
    stop: AbortController,
    extra: Partial<RunSchedulesOptions> = {},
  ): RunSchedulesOptions => ({
    queue: failing.queue,
    signal: stop.signal,
    schedules: [
      { name: "a", cron: cronSchedule("* * * * *"), handler: "tick" },
      { name: "b", cron: cronSchedule("0 0 1 1 *"), handler: "tick" },
    ],
    ...extra,
  });
  const first = new AbortController();
  await assert.rejects(
    runSchedulesWithClock(
      options(first),
      virtualClock("2026-09-29T10:00:30Z", "2026-09-29T11:00:00Z", first).clock,
    ),
    /queue unavailable/,
  );
  const second = new AbortController();
  const failures: string[] = [];
  await runSchedulesWithClock(
    options(second, {
      onError(error, failure) {
        failures.push(`${failure.schedule}@${failure.slot.toISOString()}`);
        assert.match(String(error), /queue unavailable/);
        throw new Error("observer failure is ignored");
      },
    }),
    virtualClock("2026-09-29T10:00:30Z", "2026-09-29T10:01:30Z", second).clock,
  );
  assert.deepEqual(failures, [
    "a@2026-09-29T10:00:00.000Z",
    "a@2026-09-29T10:01:00.000Z",
  ]);
  const third = new AbortController();
  const invalidRun: string[] = [];
  await runSchedulesWithClock(
    {
      queue: failing.queue,
      signal: third.signal,
      onError: (error) => invalidRun.push(String(error)),
      schedules: [
        {
          name: "invalid",
          cron: cronSchedule("* * * * *"),
          handler: "tick",
          runId: () => "",
        },
      ],
    },
    virtualClock("2026-09-29T10:00:30Z", "2026-09-29T10:00:30Z", third).clock,
  );
  assert.match(invalidRun[0] ?? "", /runId/);
});

test("runSchedules validates schedules and stops on abort", async () => {
  const { queue } = recordingQueue();
  const signal = AbortSignal.abort();
  const cron = cronSchedule("* * * * *");
  for (const schedules of [
    [],
    [{ name: "bad name", cron, handler: "x" }],
    [
      { name: "same", cron, handler: "x" },
      { name: "same", cron, handler: "x" },
    ],
    [{ name: "x", cron: {} as typeof cron, handler: "x" }],
    [{ name: "x", cron, handler: "" }],
  ])
    await assert.rejects(runSchedules({ queue, signal, schedules }));
  await assert.rejects(
    runSchedules({
      queue,
      signal,
      maxLateMs: -1,
      schedules: [{ name: "x", cron, handler: "x" }],
    }),
  );
  const stop = new AbortController();
  const running = runSchedules({
    queue,
    signal: stop.signal,
    schedules: [{ name: "x", cron: cronSchedule("0 0 1 1 *"), handler: "x" }],
  });
  stop.abort();
  await running;
});
