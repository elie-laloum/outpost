import { test } from "node:test";
import assert from "node:assert/strict";
import { createReplayAgent, ReplayDivergence } from "../../src/index.ts";

const usage = { input: 2, cached: 1, output: 3 };
const entry = (kind: string, fields: Record<string, unknown> = {}) => ({
  kind,
  seq: 1,
  at: "2026-09-28T00:00:00.000Z",
  source: "agent",
  scope: { dispatchId: "d", pass: 1 },
  pass: 1,
  ...fields,
});
const baseline = { commit: "a".repeat(40), tree: "b".repeat(40) };

test("decision replay validates observations and retains their ordering and child scope", () => {
  const decision = (kind: string, fields: Record<string, unknown> = {}) =>
    entry(kind, {
      source: "decision",
      scope: { pass: 1, subagentId: "child" },
      ...fields,
    });
  const summary = {
    provider: "router",
    model: "fixture",
    status: "finished",
    usage,
    durationMs: 10,
    truncated: false,
    code: "response",
  };
  const selected = createReplayAgent({
    journal: [
      entry("prompt", { text: "work" }),
      entry("step", { index: 1 }),
      decision("decision", summary),
      decision("decision-request", { request: { state: "work" } }),
      decision("decision-response", { response: { model: "fixture" } }),
      entry("summary", { tokens: usage }),
    ],
  });
  const decisions = selected.turns[0]?.decisionEvents;
  assert.equal(decisions?.length, 3);
  assert.ok(
    decisions?.every(
      (event) => event.before === 1 && event.subagentId === "child",
    ),
  );
  assert.equal(selected.turns[0]?.events.length, 1);
  assert.deepEqual(selected.turns[0]?.usage, usage);
  for (const change of [
    { status: "invalid" },
    { durationMs: -1 },
    { truncated: "yes" },
    { code: 1 },
    { model: 1 },
    { usage: { ...usage, input: -1 } },
  ]) {
    assert.throws(() =>
      createReplayAgent({
        journal: [
          entry("prompt", { text: "work" }),
          decision("decision", { ...summary, ...change }),
        ],
      }),
    );
  }
  for (const kind of ["decision-request", "decision-response"])
    assert.throws(
      () =>
        createReplayAgent({
          journal: [entry("prompt", { text: "work" }), decision(kind)],
        }),
      /has no/,
    );
});

test("replay agents parse recorded turns, text fallbacks and failures", () => {
  const selected = createReplayAgent({
    journal: [
      entry("dispatch-start", { source: "sandbox" }),
      entry("operation", { source: "sandbox", name: "agent.prepare" }),
      entry("phase", { name: "running" }),
      entry("text", { text: "orphan" }),
      entry("prompt", { text: "first" }),
      entry("raw", { value: "line one" }),
      entry("raw", { value: "line two" }),
      entry("conversation", { id: "c1" }),
      entry("summary", { durationMs: 1, status: 0, tokens: usage }),
      entry("prompt", { text: "second" }),
      entry("text", { text: "a" }),
      entry("text", { text: "b", subagentId: "s1" }),
      entry("summary", {
        durationMs: 1,
        status: 0,
        tokens: { ...usage, cacheCreated: 1, complete: false },
      }),
      entry("prompt", { text: "third" }),
      entry("result", { text: "final" }),
      entry("failure", { message: "agent failed" }),
      entry("workspace-commits", {
        source: "git",
        baseline,
        commits: [
          {
            oid: "c".repeat(40),
            tree: "d".repeat(40),
            author: { name: "A", email: "a@example.test", date: "1 +0000" },
            committer: { name: "C", email: "c@example.test", date: "2 +0000" },
            message: "Change\n",
            patch: "",
          },
        ],
      }),
      entry("warning", { message: "after recording" }),
      entry("dispatch-finished", {
        source: "sandbox",
        status: "failed",
        error: { code: "unknown-code", message: "Dispatch failed" },
      }),
    ],
  });
  assert.equal(selected.kind, "replay");
  assert.equal(selected.name, "replay");
  assert.equal(selected.source, "agent");
  assert.equal(selected.divergence, "fail");
  assert.equal(selected.resumable, true);
  assert.equal(selected.capture, false);
  assert.equal(selected.forkable, false);
  const [first, second, third] = selected.turns;
  assert.equal(first?.text, "line one\nline two");
  assert.equal(first?.conversation, "c1");
  assert.deepEqual(first?.usage, usage);
  assert.equal(first?.failure, undefined);
  assert.equal(second?.text, "ab");
  assert.deepEqual(second?.events[1], {
    kind: "text",
    text: "b",
    subagentId: "s1",
  });
  assert.deepEqual(second?.usage, {
    ...usage,
    cacheCreated: 1,
    complete: false,
  });
  assert.equal(third?.text, "final");
  assert.deepEqual(third?.failure, {
    code: "process",
    message: "Dispatch failed",
  });
  assert.equal(third?.events.length, 2);
  assert.ok(third?.changes && "commits" in third.changes);
  assert.equal(selected.remainingTurns, 3);
  assert.equal(selected.nextTurn(), first);
  assert.equal(selected.remainingTurns, 2);
  selected.nextTurn();
  selected.nextTurn();
  assert.equal(selected.nextTurn(), undefined);
  assert.equal(selected.remainingTurns, 0);
});

test("replay agents mark unfinished and unrecorded journals", () => {
  const selected = createReplayAgent({
    journal: [
      entry("prompt", { text: "work", source: "harness" }),
      entry("failure", { message: "stopped early" }),
    ],
    divergence: "warn",
  });
  assert.equal(selected.source, "harness");
  assert.equal(selected.divergence, "warn");
  assert.deepEqual(selected.turns[0]?.failure, {
    code: "process",
    message: "stopped early",
  });
  assert.deepEqual(selected.turns[0]?.changes, {
    kind: "workspace-commits",
    unavailable: "The journal was recorded without logging.replayable",
  });
  const cancelled = createReplayAgent({
    journal: [
      entry("prompt", { text: "work" }),
      entry("workspace-commits", { baseline, unavailable: "too large" }),
      entry("dispatch-finished", {
        error: { code: "aborted", message: "Cancelled" },
      }),
    ],
  });
  assert.deepEqual(cancelled.turns[0]?.failure, {
    code: "aborted",
    message: "Cancelled",
  });
  assert.deepEqual(cancelled.turns[0]?.changes, {
    kind: "workspace-commits",
    baseline,
    unavailable: "too large",
  });
  assert.equal(
    createReplayAgent({ journal: [entry("prompt", { text: "x" })] }).turns[0]
      ?.failure?.message,
    "The recorded agent turn did not finish",
  );
});

test("replay agents reject invalid options and malformed journals", () => {
  const invalid: readonly [unknown, RegExp][] = [
    [undefined, /must be an object/],
    [{ journal: "no" }, /returned by readJournal/],
    [{ journal: [], divergence: "ignore" }, /fail or warn/],
    [{ journal: [] }, /no agent turns/],
    [{ journal: [null] }, /entry 0 is malformed/],
    [{ journal: [{ source: "agent" }] }, /entry 0 has no event kind/],
    [{ journal: [entry("prompt")] }, /requires a string text/],
    [
      {
        journal: [
          entry("prompt", { text: "x" }),
          entry("summary", { tokens: { ...usage, output: -1 } }),
        ],
      },
      /invalid output usage/,
    ],
    [
      {
        journal: [
          entry("prompt", { text: "x" }),
          entry("summary", { tokens: { ...usage, complete: "yes" } }),
        ],
      },
      /invalid usage completeness/,
    ],
    [
      {
        journal: [
          entry("prompt", { text: "x" }),
          entry("workspace-commits", { commits: [] }),
        ],
      },
      /malformed workspace commits/,
    ],
    [
      {
        journal: [
          entry("prompt", { text: "x" }),
          entry("workspace-commits", { baseline, commits: [{ oid: "x" }] }),
        ],
      },
      /requires a string tree/,
    ],
    [
      {
        journal: [
          entry("prompt", { text: "x" }),
          entry("dispatch-finished", { error: "failed" }),
        ],
      },
      /entry 1 is malformed/,
    ],
  ];
  for (const [options, message] of invalid)
    assert.throws(
      () => createReplayAgent(options as never),
      (error: unknown) =>
        error instanceof Error &&
        (error as { code?: string }).code === "configuration" &&
        message.test(error.message),
    );
});

test("replay divergences expose their details", () => {
  const divergence = new ReplayDivergence({
    kind: "tree",
    turn: 2,
    commit: "abc",
    expected: "e",
    actual: "a",
  });
  assert.equal(divergence.name, "ReplayDivergence");
  assert.equal(divergence.code, "replay");
  assert.equal(
    divergence.message,
    "Replay turn 2 could not reproduce the tree of recorded commit abc",
  );
  assert.deepEqual(
    [
      divergence.kind,
      divergence.turn,
      divergence.commit,
      divergence.expected,
      divergence.actual,
    ],
    ["tree", 2, "abc", "e", "a"],
  );
  assert.deepEqual(divergence.details, {
    kind: "tree",
    turn: 2,
    commit: "abc",
    expected: "e",
    actual: "a",
  });
});

test("replay preserves the rejected fault code instead of classifying it as process", () => {
  const selected = createReplayAgent({
    journal: [
      entry("prompt", { text: "work" }),
      entry("dispatch-finished", {
        error: { code: "rejected", message: "Review rejected" },
      }),
    ],
  });
  assert.deepEqual(selected.turns[0]?.failure, {
    code: "rejected",
    message: "Review rejected",
  });
});
