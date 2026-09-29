import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createAgent,
  createClaudeHarness,
  createFallbackAgent,
  OutpostError,
} from "../../src/index.ts";
import type { Agent, FallbackTrigger } from "../../src/index.ts";
import {
  dispatchCandidates,
  fallbackCandidate,
  fallbackFailure,
} from "../../src/domain/fallback-agent.ts";
import { scripted } from "../helpers.ts";

const opus = createAgent({ harness: createClaudeHarness(), model: "opus" });
const sonnet = createAgent({ harness: createClaudeHarness(), model: "sonnet" });

test("createFallbackAgent freezes an ordered candidate list with an explicit policy", () => {
  const candidates: [Agent, Agent] = [opus, sonnet];
  const on: FallbackTrigger[] = ["quota"];
  const coder = createFallbackAgent(candidates, { on });
  candidates.pop();
  on.push("unavailable");
  assert.equal(coder.kind, "fallback");
  assert.deepEqual(coder.agents, [opus, sonnet]);
  assert.deepEqual(coder.on, ["quota"]);
  assert.ok(Object.isFrozen(coder) && Object.isFrozen(coder.agents));
  assert.deepEqual(dispatchCandidates(coder), [opus, sonnet]);
  assert.deepEqual(dispatchCandidates(opus), [opus]);
  assert.deepEqual(fallbackCandidate(sonnet, 1), {
    index: 1,
    name: "claude",
    model: "sonnet",
  });
  assert.deepEqual(fallbackCandidate(scripted(""), 0), {
    index: 0,
    name: "fixture",
  });
});

test("createFallbackAgent rejects ambiguous or implicit configurations", () => {
  const invalid: readonly [unknown, unknown][] = [
    [[opus], { on: ["quota"] }],
    [[opus, sonnet], {}],
    [[opus, sonnet], { on: [] }],
    [[opus, sonnet], { on: ["timeout"] }],
    [[opus, sonnet], { on: ["quota", "quota"] }],
    [
      [opus, createFallbackAgent([opus, sonnet], { on: ["quota"] })],
      { on: ["quota"] },
    ],
    [[opus, { kind: "cli" }], undefined],
    [[opus, null], { on: ["quota"] }],
  ];
  for (const [agents, options] of invalid)
    assert.throws(
      () =>
        createFallbackAgent(
          agents as [Agent, Agent],
          options as { on: FallbackTrigger[] },
        ),
      (error) =>
        error instanceof OutpostError && error.code === "configuration",
    );
});

test("fallbackFailure maps quota and outage faults through the policy", () => {
  const quota = new OutpostError("quota", "limit", {
    resetAt: "2026-10-01T00:00:00.000Z",
  });
  const outage = new OutpostError("provider", "down", {
    unavailable: "HTTP 503",
  });
  assert.deepEqual(fallbackFailure(quota, ["quota"]), {
    failure: "quota",
    message: "limit",
    resetAt: "2026-10-01T00:00:00.000Z",
  });
  assert.equal(fallbackFailure(quota, ["unavailable"]), undefined);
  assert.deepEqual(
    fallbackFailure(new Error("wrapped", { cause: outage }), ["unavailable"]),
    { failure: "unavailable", message: "HTTP 503" },
  );
  assert.equal(fallbackFailure(outage, ["quota"]), undefined);
  assert.equal(
    fallbackFailure(new OutpostError("process", "crash"), [
      "quota",
      "unavailable",
    ]),
    undefined,
  );
});
