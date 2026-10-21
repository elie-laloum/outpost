import assert from "node:assert/strict";
import test from "node:test";
import {
  answerTaskInput,
  decideTask,
  finishTask,
  pauseTaskForQuota,
  recordTaskCacheHit,
  recordTaskFailure,
  releaseTaskQuota,
  resumeTask,
  startTask,
  startTaskAttempt,
} from "../../src/domain/workflow/task-state.ts";
import type { TaskRecord } from "../../src/domain/workflow.types.ts";
import type { WorkflowDecisionRecord } from "../../src/domain/workflow/gates.types.ts";

test("starting a task clears the previous outcome but keeps its attempts", () => {
  const state: TaskRecord = { key: "review", status: "waiting", attempts: 0 };
  startTaskAttempt(state, 2);
  recordTaskCacheHit(state);
  recordTaskFailure(state, new Error("boom"));
  finishTask(state, "failed", "2026-10-21T10:00:00.000Z");
  startTask(state, "2026-10-21T11:00:00.000Z");
  assert.deepEqual(state, {
    key: "review",
    status: "active",
    attempts: 2,
    startedAt: "2026-10-21T11:00:00.000Z",
  });
});

test("answers reopen a waiting task and quota resumes keep the attempt", () => {
  const state: TaskRecord = { key: "clarify", status: "active", attempts: 1 };
  finishTask(state, "waiting-input", "2026-10-21T10:00:00.000Z");
  answerTaskInput(state, {
    answer: {
      executionId: "run-1",
      key: "clarify",
      requestId: "q1",
      actor: "local",
      value: "main",
      answeredAt: "2026-10-21T10:01:00.000Z",
    },
  });
  assert.equal(state.status, "waiting");
  assert.equal(state.finishedAt, undefined);

  pauseTaskForQuota(state, {
    requestedAt: "2026-10-21T10:05:00.000Z",
    message: "limit",
  });
  assert.ok(Object.isFrozen(state.quota));
  finishTask(state, "paused", "2026-10-21T10:05:00.000Z");
  releaseTaskQuota(state);
  resumeTask(state);
  assert.equal(state.status, "active");
  assert.equal(state.quota, undefined);
  assert.equal(state.finishedAt, undefined);
  assert.equal(state.attempts, 1);
});

test("rejected decisions record both the decision and the rejection", () => {
  const state: TaskRecord = { key: "approve", status: "paused", attempts: 0 };
  const decision: WorkflowDecisionRecord = {
    executionId: "run-1",
    key: "approve",
    requestId: "gate-1",
    action: "reject",
    actor: "reviewer",
    reason: "missing tests",
    decidedAt: "2026-10-21T10:02:00.000Z",
  };
  decideTask(state, decision, "approve rejected by reviewer: missing tests");
  assert.equal(state.decision, decision);
  assert.equal(state.error, "approve rejected by reviewer: missing tests");
  const accepted: TaskRecord = {
    key: "approve",
    status: "paused",
    attempts: 0,
  };
  decideTask(accepted, { ...decision, action: "approve" });
  assert.equal(accepted.error, undefined);
});
