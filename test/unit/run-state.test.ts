import assert from "node:assert/strict";
import { test } from "node:test";
import type {
  ObservationEvent,
  ObservationScope,
  RunSnapshot,
} from "../../src/index.ts";
import { projectRun, emptyRunUsage } from "../../src/domain/run.ts";
import {
  runSnapshot,
  runEvent,
  runInterval,
  runReadLimit,
} from "../../src/infrastructure/run-storage.ts";
const at = "2026-10-07T10:00:00.000Z";
function initial(): RunSnapshot {
  return {
    version: 1,
    id: "test",
    kind: "dispatch",
    status: "running",
    seq: 0,
    observationSeq: 0,
    complete: true,
    startedAt: at,
    updatedAt: at,
    heartbeatAt: at,
    expiresAt: at,
    tasks: [],
    dispatches: [],
    commits: [],
    usage: emptyRunUsage(),
    errors: [],
  };
}
function apply(
  run: RunSnapshot,
  event: ObservationEvent,
  scope: ObservationScope = { dispatchId: "d", pass: 1 },
) {
  return projectRun(run, {
    seq: run.observationSeq + 1,
    at,
    source: "agent",
    scope,
    event,
  });
}
const tokens = { input: 10, cached: 2, output: 3 };
test("dispatch projection replaces cumulative counters and summaries, sums passes and excludes nested agent usage", () => {
  let run = apply(initial(), {
    kind: "phase",
    name: "running",
    agent: "coder",
    branch: "branch",
  });
  run = apply(run, { kind: "usage", tokens });
  run = apply(run, {
    kind: "usage",
    tokens: { input: 20, cached: 3, output: 4 },
    cumulative: true,
  });
  run = apply(run, {
    kind: "summary",
    tokens: { input: 30, cached: 4, output: 5 },
    status: 0,
    durationMs: 5,
  });
  run = apply(run, { kind: "usage", tokens }, { dispatchId: "d", pass: 2 });
  run = apply(
    run,
    { kind: "usage", tokens },
    { dispatchId: "d", pass: 2, subagentId: "child" },
  );
  run = apply(
    run,
    { kind: "phase", name: "child", agent: "other" },
    { dispatchId: "d", subagentId: "child" },
  );
  assert.deepEqual(run.usage, { input: 40, cached: 6, output: 8 });
  assert.equal(run.dispatches[0]?.agent, "coder");
  assert.equal(run.dispatches[0]?.phase, "running");
  run = apply(run, {
    kind: "fallback",
    from: { index: 0, name: "coder" },
    to: { index: 1, name: "backup" },
    failure: "quota",
    message: "limit",
  });
  assert.equal(run.dispatches[0]?.agent, "backup");
  run = apply(run, {
    kind: "dispatch-finished",
    status: "cancelled",
    completed: false,
    usage: tokens,
    error: { message: "cancelled" },
  });
  assert.equal(run.status, "cancelled");
  assert.deepEqual(run.usage, tokens);
  assert.deepEqual(run.errors, [{ message: "cancelled" }]);
  assert.deepEqual(runSnapshot(run), run);
});
test("projection fences execution identity and combines commits without double-counting workflow tokens", () => {
  const record = { key: "task", status: "waiting" as const, attempts: 0 };
  let run = apply(
    { ...initial(), kind: "workflow" },
    {
      kind: "workflow",
      event: {
        type: "start",
        executionId: "wf",
        workflow: "workflow",
        timestamp: at,
        tasks: [record],
        accounting: { attempts: 0, tokens: emptyRunUsage() },
      },
    },
    {},
  );
  assert.throws(
    () =>
      apply(run, {
        kind: "workflow",
        event: {
          type: "start",
          executionId: "other",
          workflow: "workflow",
          timestamp: at,
        },
      }),
    /different workflow/,
  );
  assert.throws(
    () =>
      apply(initial(), {
        kind: "workflow",
        event: {
          type: "start",
          executionId: "wf",
          workflow: "workflow",
          timestamp: at,
        },
      }),
    /dispatch projection/,
  );
  assert.throws(
    () =>
      apply(
        run,
        { kind: "dispatch-start" },
        { executionId: "other", dispatchId: "d" },
      ),
    /different workflow/,
  );
  run = apply(
    run,
    {
      kind: "workflow",
      event: {
        type: "task",
        status: "active",
        key: "task",
        attempt: 0,
        executionId: "wf",
        workflow: "workflow",
        timestamp: at,
      },
    },
    {},
  );
  assert.equal(run.tasks[0]?.startedAt, at);
  run = apply(
    run,
    {
      kind: "workflow",
      event: {
        type: "usage",
        usage: tokens,
        key: "task",
        attempt: 1,
        executionId: "wf",
        workflow: "workflow",
        timestamp: at,
        accounting: {
          attempts: 1,
          tokens,
          cost: { amount: 0.2, currency: "EUR", complete: true },
        },
      },
    },
    {},
  );
  const commit = { oid: "oid", subject: "change" };
  for (const id of ["d1", "d2"])
    run = apply(
      run,
      {
        kind: "dispatch-finished",
        status: "done",
        completed: true,
        usage: tokens,
        commits: [commit],
      },
      { dispatchId: id, executionId: "wf", taskKey: "task", attempt: 1 },
    );
  assert.equal(run.commits.length, 1);
  assert.deepEqual(run.usage, tokens);
  assert.deepEqual(run.tasks[0]?.usage, tokens);
  run = apply(
    run,
    {
      kind: "workflow",
      event: {
        type: "task",
        status: "failed",
        key: "task",
        error: "check failed",
        executionId: "wf",
        workflow: "workflow",
        timestamp: at,
      },
    },
    {},
  );
  assert.equal(run.tasks[0]?.finishedAt, at);
  assert.equal(run.tasks[0]?.error, "check failed");
  run = apply(
    run,
    {
      kind: "workflow",
      event: {
        type: "finish",
        status: "failed",
        executionId: "wf",
        workflow: "workflow",
        timestamp: at,
      },
    },
    {},
  );
  assert.deepEqual(run.errors, [{ message: "check failed" }]);
  assert.deepEqual(runSnapshot(run), run);
  const single = apply(initial(), { kind: "dispatch-start" });
  assert.throws(
    () => apply(single, { kind: "dispatch-start" }, { dispatchId: "other" }),
    /different dispatch/,
  );
});
test("stored projections validate versions, statuses, counters, timestamps and nested records at the boundary", () => {
  const base = initial();
  for (const invalid of [
    null,
    [],
    { ...base, version: 2 },
    { ...base, kind: "other" },
    { ...base, status: "abandoned" },
    { ...base, seq: -1 },
    { ...base, complete: "true" },
    { ...base, startedAt: "yesterday" },
    { ...base, usage: { input: -1, cached: 0, output: 0 } },
    { ...base, tasks: {} },
    { ...base, tasks: [{ key: "k", status: "other", attempts: 0 }] },
    { ...base, dispatches: [{ status: "paused" }] },
    {
      ...base,
      accounting: {
        attempts: 0,
        tokens,
        cost: { amount: -1, currency: "EUR" },
      },
    },
    {
      ...base,
      accounting: { attempts: 0, tokens, cost: { amount: 1, currency: "GBP" } },
    },
    { ...base, errors: [{ message: 1 }] },
  ])
    assert.throws(() => runSnapshot(invalid));
  assert.deepEqual(runSnapshot(base), base);
  assert.equal(runInterval(1, "pollMs"), 1);
  for (const interval of [0, -1, 0.5, 2_147_483_648])
    assert.throws(() => runInterval(interval, "pollMs"));
  assert.throws(() => runReadLimit(0));
  const scope = {
    executionId: "wf",
    taskKey: "task",
    attempt: 2,
    dispatchId: "d",
    pass: 3,
    subagentId: "s",
    candidate: "c",
  };
  const event = {
    seq: 2,
    observationSeq: 1,
    at,
    source: "agent",
    scope,
    event: { kind: "text", text: "value" },
  };
  assert.deepEqual(runEvent(event), event);
  assert.throws(() => runEvent({ ...event, scope: { attempt: -1 } }));
  assert.throws(() => runEvent({ ...event, seq: 0 }));
  const { event: _payload, ...missing } = event;
  assert.throws(() => runEvent(missing), /Missing/);
});

test("resumed active tasks clear previous settlement metadata and unknown historical usage stays explicit", () => {
  const record = {
    key: "task",
    status: "failed" as const,
    attempts: 1,
    startedAt: "2026-10-06T10:00:00.000Z",
    finishedAt: "2026-10-06T11:00:00.000Z",
    error: "previous failure",
  };
  let run = apply(
    { ...initial(), kind: "workflow" },
    {
      kind: "workflow",
      event: {
        type: "start",
        executionId: "wf",
        workflow: "workflow",
        timestamp: at,
        tasks: [record],
        accounting: { attempts: 1, tokens },
      },
    },
    {},
  );
  assert.equal(run.tasks[0]?.usage.complete, false);
  assert.deepEqual(run.usage, tokens);
  run = apply(
    run,
    {
      kind: "workflow",
      event: {
        type: "task",
        key: "task",
        status: "active",
        executionId: "wf",
        workflow: "workflow",
        timestamp: at,
      },
    },
    {},
  );
  assert.equal(run.tasks[0]?.error, undefined);
  assert.equal(run.tasks[0]?.finishedAt, undefined);
  assert.equal(run.tasks[0]?.startedAt, at);
});
