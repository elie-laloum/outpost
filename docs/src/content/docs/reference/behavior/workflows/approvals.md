---
title: Approvals and durable pauses
description: Stop at an explicit decision, release the runner, and resume from a persisted request.
sidebar:
  order: 6
---

Use `approvalTask()` for an approve/reject gate and `pauseTask()` for a resume/reject gate. Both are ordinary graph dependencies backed by a [checkpoint](../../../../guide/advanced/checkpoints/). When a gate becomes ready, Outpost persists its request and marks its task `paused`. Independent tasks finish normally; dependents remain waiting. `start()` resolves with status `paused` after active work settles and releases the checkpoint lease. No background timer or running process is required to keep the request open.

## Create the gate

```ts
import {
  approvalTask,
  fileWorkflowCheckpointStore,
  task,
  workflow,
} from "@elie-laloum/outpost";

const build = task({
  key: "build",
  perform: () => ({ artifact: "build-42" }),
});
const approval = approvalTask({
  key: "release-approval",
  after: [build],
  prompt: "Approve publication of build-42?",
  actors: ["release-maintainer"],
});
const publish = task({
  key: "publish",
  after: [build, approval],
  perform(context) {
    const reviewed = context.value(approval);
    return {
      artifact: context.value(build).artifact,
      approvedBy: reviewed.actor,
    };
  },
});
const release = workflow("release", [build, approval, publish]);
const checkpoint = {
  store: fileWorkflowCheckpointStore({ directory: ".outpost/workflows" }),
  runId: "release-build-42",
  version: "release-definition-v1",
};
const result = await release.start({ checkpoint });
if (result.status === "paused") {
  const record = result.tasks.find((entry) => entry.key === approval.key)!;
  console.log(result.executionId, record.key, record.pause);
}
```

The example's final task returns a publication record; replace it with your explicit publication operation. A gate requires a nonempty prompt and a nonempty, unique list of permitted actor identifiers. Gates consume no task attempts or tokens. They cannot have conditions, retry policies or deadlines. Use normal tasks for automated checks, with the approval depending on their successful results.

`result.unwrap()` throws for a paused result. Check `result.status` before unwrapping if your application expects pending decisions. Requests appear in `TaskRecord.pause`, including their ID, kind, prompt, actors and creation time. Completed task values and cumulative usage remain available.

## Decide and resume

In a later process, recreate the same graph and checkpoint options. Pass a decision from your trusted input handler to `release.start({ checkpoint, decisions: [...] })`. Each `WorkflowDecision` contains:

| Field         | Meaning                                                                  |
| ------------- | ------------------------------------------------------------------------ |
| `executionId` | The paused result's execution ID.                                        |
| `key`         | The gate task's key.                                                     |
| `requestId`   | The exact persisted `record.pause.id`.                                   |
| `action`      | `approve` for an approval, `resume` for a pause, or `reject` for either. |
| `actor`       | An identifier present in the gate's `actors` list.                       |
| `reason`      | A nonempty explanation of the decision.                                  |

An approval resumes with an input shaped like this; replace the IDs with the persisted values:

```ts
import type { WorkflowDecision } from "@elie-laloum/outpost";

const decision: WorkflowDecision = {
  executionId: "execution-id-from-result",
  key: "release-approval",
  requestId: "request-id-from-record",
  action: "approve",
  actor: "release-maintainer",
  reason: "Reviewed the artifact and validation results.",
};
console.log(decision);
```

The actors list checks declared ownership; it does **not** authenticate the person submitting an identifier. Your CLI, service or approval interface must authenticate the caller and supply its trusted identity. Anyone who can call the library with an allowed actor or modify the checkpoint storage is trusted. Protect both boundaries. Audit metadata provides traceability, not a cryptographic signature or tamper-proof audit log.

Outpost validates the entire decision batch before changing any task. Unknown or already decided requests, duplicate decisions, mismatched execution/request IDs, unauthorized actors, empty reasons and an explicitly empty `decisions` array are rejected. Do not send `decisions` when only inspecting/resuming pending state. Accepted decisions are persisted before any dependent side effect can start. A later duplicate submission fails; read the saved result to reconcile a lost response.

Approval completes the gate and makes a `WorkflowDecisionRecord` available through `context.value(approval)`. The record includes the submitted decision and a server-assigned `decidedAt` timestamp, and remains in `TaskRecord.decision`. Rejection marks the gate `rejected`, records the actor and reason, skips its dependents and returns a failed workflow. Rejection remains final even with `checkpoint.resume: "retry-incomplete"`; use a new run ID to request a fresh decision.

Starting a paused run without a decision returns the same pending request. Elapsed time never approves or resumes a gate. Multiple ready gates can remain pending, and you can decide a subset at a time. An approval alone does not unblock a task with other pending dependencies.

## Restart and observation

A clean pause resumes without `retry-incomplete` because no incomplete task side effect is replayed. If a process was interrupted while an ordinary task was active, explicitly authorize that task's replay with the checkpoint policy. Completed tasks and accepted decisions are never replayed. Keep the same budgets when resuming: cumulative attempts and reported usage remain enforced, including usage before the pause.

Gate kind, prompt and actor list are part of the persisted graph identity. Changing them, dependencies or the caller's checkpoint version rejects the existing run. Request and decision fields extend checkpoint format 1; ordinary pre-gate format-1 snapshots remain supported. Applications must update exhaustive status handling for the new task statuses `paused` and `rejected`, and workflow status `paused`.

Observers receive task and finish events for pauses and task completion/rejection events on decisions. The OpenTelemetry observer closes each paused execution span with neutral status and reports rejection as an error. It does not export actor, reason or prompt as metric labels. Independent task failures still take precedence over the workflow's paused status; inspect task records to find any requests that remain pending.
