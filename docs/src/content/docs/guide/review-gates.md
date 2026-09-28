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

## Require a signed decision

Implemented, unreleased: set `authentication: "signed"` on `approvalTask()` or `pauseTask()`. This requirement participates in checkpoint identity: removing it on restart is rejected. Supply `decisionVerifier` when submitting proofs. Gates without this option retain the application-trusted actor contract above.

```ts
import { approvalTask } from "@elie-laloum/outpost";

const review = approvalTask({
  key: "review",
  prompt: "Approve deployment?",
  actors: ["maintainer"],
  authentication: "signed",
});
```

Sign the exact pending request after authenticating the user and confirming their intent. The signature covers the execution, task, request, actor, action, reason, key identifier and expiry. The signing service owns the private key; workers only need trusted public keys bound to approvers.

```ts
import {
  signWorkflowDecision,
  ed25519DecisionVerifier,
} from "@elie-laloum/outpost";
import type {
  Workflow,
  WorkflowCheckpointOptions,
  WorkflowDecision,
  WorkflowApproverKey,
} from "@elie-laloum/outpost";
import type { KeyObject } from "node:crypto";

async function submitSignedReview(
  pipeline: Workflow,
  checkpoint: WorkflowCheckpointOptions,
  decision: WorkflowDecision,
  privateKey: KeyObject,
  keyId: string,
  loadKeys: () => Promise<readonly WorkflowApproverKey[]>,
) {
  const signed = signWorkflowDecision({
    decision,
    privateKey,
    keyId,
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  });
  return pipeline.start({
    checkpoint,
    decisions: [signed],
    decisionVerifier: ed25519DecisionVerifier({ keys: loadKeys }),
  });
}
```

Verification rejects unauthorized actors, altered decisions, expired proofs, unknown or duplicated key identifiers and reused requests. All submitted decisions are validated before any is applied. Audit records retain the verified key identifier and verification time; no private key or bearer token is stored.

## Rotate approver keys

Publish a new public key with a unique `keyId` and the same actor binding, switch the signing service to its private key, then remove the old public key after the overlap period. The verifier reloads keys on each decision. Removing a key immediately rejects new proofs using it; already persisted approvals remain accepted, including after expiry. Checkpoint storage remains a trusted boundary: these signatures do not authenticate the checkpoint itself.

Keep signing keys and workflow decision submission under separate application access controls where needed. A custom `WorkflowDecisionVerifier` is trusted code and must enforce signature, actor and expiration checks itself. See [worker operations](../background-jobs/#operate-workers) for queue credentials and recovery.
