import assert from "node:assert/strict";
import { test } from "node:test";
import { join } from "node:path";
import {
  defineDecision,
  defineDecisionTask,
  defineTask,
  defineWorkflow,
  createLocalTransport,
  createWorkflowCheckpointStore,
  createTaskCacheStore,
  createObservationHub,
  OutpostError,
} from "../../src/index.ts";
import type {
  DecisionProvider,
  Observation,
  WorkflowCheckpoint,
  WorkflowCheckpointStore,
} from "../../src/index.ts";
import { repository } from "../helpers.ts";

const declaration = defineDecision({
  questions: { flag: { type: "noul", instructions: "Needed?" } },
});
const answer = {
  model: "fixture",
  answers: { flag: { type: "noul", noul: 0.9 } },
  usage: { input: 4, cached: 0, output: 1 },
};

test("decision tasks checkpoint typed dependencies and reuse cached JSON without usage", async (t) => {
  const root = await repository(t);
  const transporter = createLocalTransport({
    directory: join(root, "storage"),
  });
  const checkpoint = {
    store: createWorkflowCheckpointStore({ transporter }),
    runId: "decision",
    version: "1",
  };
  let calls = 0;
  const provider: DecisionProvider = {
    name: "fixture",
    request: async (request) => {
      calls++;
      assert.deepEqual(request.state, { request: "work" });
      assert.ok(request.signal);
      return answer;
    },
  };
  const input = defineTask({
    key: "input",
    perform: () => ({ request: "work" }),
  });
  const triage = defineDecisionTask({
    key: "triage",
    after: [input],
    provider,
    model: "fixture",
    decision: declaration,
    state: async (context) => context.value(input),
  });
  const workflow = defineWorkflow("decision", [input, triage]);
  const events: Observation[] = [];
  const observation = createObservationHub({
    scope: { executionId: "fixture" },
    sinks: [
      {
        observe: (event) => {
          events.push(event);
        },
      },
    ],
  });
  const first = await workflow.start({ checkpoint, observation });
  first.unwrap();
  assert.equal(first.value(triage).answers.flag.noul, 0.9);
  assert.equal(first.usage.tokens.input, 4);
  assert.ok(
    events.some(
      (event) =>
        event.source === "decision" &&
        event.scope.taskKey === "triage" &&
        event.scope.attempt === 1,
    ),
  );
  const second = await workflow.start({ checkpoint });
  second.unwrap();
  assert.equal(calls, 1);
  assert.equal(second.usage.tokens.input, 4);
  const store = createTaskCacheStore({ transporter });
  const cached = defineDecisionTask({
    key: "cached",
    provider,
    model: "fixture",
    decision: declaration,
    state: { request: "work" },
    cache: {
      store,
      version: "fixture-1",
      key: () => ({
        request: "work",
        questions: declaration.questions,
        provider: provider.name,
        model: "fixture",
      }),
    },
  });
  const cachedWorkflow = defineWorkflow("cached", [cached]);
  (await cachedWorkflow.start()).unwrap();
  const hit = await cachedWorkflow.start();
  hit.unwrap();
  assert.equal(calls, 2);
  assert.equal(hit.usage.attempts, 0);
  assert.equal(hit.usage.tokens.input, 0);
  assert.equal(hit.value(cached).answers.flag.noul, 0.9);
  await observation.close();
});

test("decision retries account usage and truncated rejections consume tokens", async () => {
  let calls = 0;
  const provider: DecisionProvider = {
    name: "fixture",
    request: async () => {
      calls++;
      if (calls === 1)
        throw new OutpostError("provider", "unavailable", {
          unavailable: "fixture",
        });
      return answer;
    },
  };
  const item = defineDecisionTask({
    key: "retry",
    provider,
    model: "fixture",
    decision: declaration,
    state: "work",
    retry: { attempts: 2 },
  });
  const result = await defineWorkflow("retry", [item]).start();
  result.unwrap();
  assert.equal(calls, 2);
  assert.equal(result.usage.tokens.input, 4);
  assert.equal(result.usage.attempts, 2);
  assert.equal(result.usage.tokens.complete, false);
  const truncated = defineDecisionTask({
    key: "truncated",
    provider: {
      name: "fixture",
      request: async () => ({ ...answer, truncated: true }),
    },
    model: "fixture",
    decision: declaration,
    state: "work",
  });
  const rejected = await defineWorkflow("truncated", [truncated]).start();
  assert.equal(rejected.status, "failed");
  assert.equal(rejected.usage.tokens.input, 4);
  const bounded = await defineWorkflow("budget", [item]).start({
    budget: { usage: { input: 3 } },
  });
  assert.notEqual(bounded.status, "done");
  assert.equal(bounded.usage.tokens.input, 4);
});

test("decision timeouts abort the request and interrupted checkpoints require explicit replay", async () => {
  let snapshot: WorkflowCheckpoint | undefined;
  let active: WorkflowCheckpoint | undefined;
  const store: WorkflowCheckpointStore = {
    acquire: async () => ({
      read: async () => snapshot,
      write: async (value) => {
        snapshot = structuredClone(value);
        if (
          value.records.some(
            (record) =>
              record.key === "triage" &&
              record.status === "active" &&
              record.attempts === 1,
          )
        )
          active = structuredClone(value);
      },
      release: async () => {},
    }),
  };
  let calls = 0;
  const provider: DecisionProvider = {
    name: "fixture",
    request: async () => {
      calls++;
      return answer;
    },
  };
  const item = defineDecisionTask({
    key: "triage",
    provider,
    model: "fixture",
    decision: declaration,
    state: "work",
  });
  const workflow = defineWorkflow("recovery", [item]);
  const checkpoint = { store, runId: "fixture", version: "1" };
  (await workflow.start({ checkpoint })).unwrap();
  assert.ok(active);
  snapshot = active;
  await assert.rejects(
    workflow.start({ checkpoint }),
    /explicitly authorize replay/,
  );
  assert.equal(calls, 1);
  snapshot = active;
  const resumed = await workflow.start({
    checkpoint: { ...checkpoint, resume: "retry-incomplete" },
  });
  resumed.unwrap();
  assert.equal(calls, 2);
  let aborted = false;
  const slow = defineDecisionTask({
    key: "slow",
    provider: {
      name: "slow",
      request: async (request) =>
        new Promise((_resolve, reject) => {
          request.signal?.addEventListener(
            "abort",
            () => {
              aborted = true;
              reject(request.signal?.reason);
            },
            { once: true },
          );
        }),
    },
    model: "fixture",
    decision: declaration,
    state: "work",
    timeoutMs: 20,
  });
  const stopped = await defineWorkflow("timeout", [slow]).start();
  assert.equal(stopped.status, "failed");
  assert.equal(aborted, true);
});
