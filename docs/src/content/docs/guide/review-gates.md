---
title: "Review gates"
description: "Pause a workflow for an explicit trusted decision."
---

Use `approvalTask()` to stop a workflow until a permitted actor approves or rejects. Gates require a checkpoint so the request survives the current process.

```ts
import {
  approvalTask,
  localTransport,
  workflow,
  workflowCheckpointStore,
} from "@elie-laloum/outpost";

const approve = approvalTask({
  key: "approve",
  prompt: "Approve the reviewed change?",
  actors: ["maintainer"],
});
const pipeline = workflow("delivery", [approve]);
const store = workflowCheckpointStore({
  transporter: localTransport({ directory: ".outpost/storage" }),
});
const result = await pipeline.start({
  checkpoint: { store, runId: "delivery-42", version: "1" },
});
console.log(result.status, result.tasks[0]?.pause);
```

<!-- check:run -->

## Submit a decision

Read the paused record and restart the same workflow with `decisions`. Each decision supplies `executionId`, task `key`, pending `requestId`, `actor`, `reason` and `action: "approve"` or `"reject"`. A decision must match the actual pending request; do not construct it from a stale UI record.

```ts
import type {
  Workflow,
  WorkflowCheckpointOptions,
  WorkflowResult,
} from "@elie-laloum/outpost";

async function approveReview(
  pipeline: Workflow,
  paused: WorkflowResult,
  checkpoint: WorkflowCheckpointOptions,
) {
  const pending = paused.tasks.find(
    (record) => record.key === "approve",
  )?.pause;
  if (!pending) throw new Error("No pending approval");
  return pipeline.start({
    checkpoint,
    decisions: [
      {
        executionId: paused.executionId,
        key: "approve",
        requestId: pending.id,
        actor: "maintainer",
        reason: "Reviewed the patch and test results",
        action: "approve",
      },
    ],
  });
}
```

Place delivery tasks after the gate. Rejection prevents their normal execution. `pauseTask()` follows the same persisted pattern but expects `action: "resume"` to continue.

## Authenticate the actor

Actor names are trusted metadata supplied by your application. Outpost does not log a user in or prove who clicked a button. Authenticate users and authorize their decisions before passing them into `start()`.

A sentence asking the agent to wait is not a gate. The dependency graph must enforce the wait.

API: [approvalTask](../../reference/approvaltask/) · [pauseTask](../../reference/pausetask/) · [WorkflowDecision](../../reference/workflowdecision/).
