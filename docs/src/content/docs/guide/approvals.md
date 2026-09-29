---
title: "Approvals"
description: "Stop a workflow at a gate until a person approves or rejects, then resume it from its checkpoint, even in another process."
---

## Add a gate

A gate is a task that waits for a person’s decision. Tasks after it run once an allowed actor approves.

```ts
import {
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineApprovalTask,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";

const approve = defineApprovalTask({
  key: "approve",
  prompt: "Deploy release 1.4 to production?",
  actors: ["maintainer"],
});
const deploy = defineTask({
  key: "deploy",
  after: [approve],
  perform: (context) => `Deployed, approved by ${context.value(approve).actor}`,
});
const workflow = defineWorkflow("release", [approve, deploy]);
const checkpoint = {
  store: createWorkflowCheckpointStore({
    transporter: createLocalTransport({ directory: ".outpost/storage" }),
  }),
  runId: "release-1.4",
  version: "1",
};

const paused = await workflow.start({ checkpoint });
const request = paused.tasks.find((task) => task.key === "approve")?.pause;
console.log(paused.status, request?.prompt);

// Later, once your application has authenticated the maintainer:
const result = await workflow.start({
  checkpoint,
  decisions: [
    {
      executionId: paused.executionId,
      key: "approve",
      requestId: request!.id,
      actor: "maintainer",
      reason: "Release notes and staging checks reviewed",
      action: "approve",
    },
  ],
});
console.log(result.status, result.value(deploy));
```

<!-- check:run -->

It prints `paused Deploy release 1.4 to production?`, then `done Deployed, approved by maintainer`.

A gate needs a checkpoint, the saved state of the run under `.outpost/storage`. The second `start()` can run in another process, days later.

## Submit a decision

<!-- flow -->

1. **Pause**: The run stops at the gate.
   - **Save the request**: The gate’s record holds it in `pause`: `id`, `prompt`, `actors`.
   - **Return**: Status `paused`, once independent tasks have finished.
2. **Decide**: In your application.
   - **Show the request**: To a person listed in `actors`.
   - **Submit**: `start()` with the same checkpoint and `decisions`.
3. **Continue**: According to `action`.
   - **Approve**: Dependent tasks run and read the decision as the gate’s value.
   - **Reject**: Dependent tasks are skipped and the run ends `failed`.

| Decision field | Value                                                 |
| -------------- | ----------------------------------------------------- |
| `executionId`  | `executionId` of the paused result                    |
| `key`          | The gate’s `key`                                      |
| `requestId`    | `pause.id` of the gate’s record                       |
| `actor`        | One of the gate’s `actors`                            |
| `reason`       | A nonempty explanation, kept in the checkpoint        |
| `action`       | `"approve"` (or `"resume"` for a pause) or `"reject"` |

`start()` throws, applying no decision, when one does not match the pending request.

## Pause without approving

`definePauseTask()` takes the same options and holds the run until someone lets it go on, for example after a maintenance window. Continue with `action: "resume"` or stop with `"reject"`.

## Authenticate the actor

Outpost checks that `actor` is listed in `actors`, not who the person is. Log the person in and check their right to decide before you call `start()`.

Asking an agent in its brief to wait for approval is not a gate: only a gate task stops the run.

## Require a signed decision

With `authentication: "signed"` on the gate, a decision needs an Ed25519 signature from a key bound to its actor. Only your signing service holds private keys; keep them out of worker sandboxes.

```ts
import {
  createEd25519DecisionVerifier,
  signWorkflowDecision,
} from "@elie-laloum/outpost";
import type {
  Workflow,
  WorkflowApproverKey,
  WorkflowCheckpointOptions,
  WorkflowDecision,
} from "@elie-laloum/outpost";
import type { KeyObject } from "node:crypto";

// Signing service, after authenticating the approver.
export function sign(decision: WorkflowDecision, privateKey: KeyObject) {
  return signWorkflowDecision({
    decision,
    privateKey,
    keyId: "maintainer-2026",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  });
}

// Workflow side: public keys only.
export function submit(
  workflow: Workflow,
  checkpoint: WorkflowCheckpointOptions,
  signed: WorkflowDecision,
  keys: () => Promise<readonly WorkflowApproverKey[]>,
) {
  return workflow.start({
    checkpoint,
    decisions: [signed],
    decisionVerifier: createEd25519DecisionVerifier({ keys }),
  });
}
```

The signature covers every decision field plus `keyId` and `expiresAt`. Each `WorkflowApproverKey` binds a `keyId` to one `actor` and its `publicKey`.

Expiry is checked against the worker clock, so keep the signing service and workers in time sync. Altered or expired decisions, and keys that are unknown, duplicated or bound to another actor, are rejected. The checkpoint keeps the verified `keyId`, and a restart that drops `authentication` is rejected.

## Rotate approver keys

<!-- flow -->

1. **Add**: Publish the new public key.
   - **Bind it**: A new `keyId` for the same actor, next to the old key.
2. **Switch**: Sign with the new private key.
   - **Overlap**: Both keys verify decisions still in flight.
3. **Remove**: Drop the old public key.
   - **Revoke**: Its new proofs fail; recorded approvals stay valid.

`keys` runs for every signed decision, so changes apply without a restart.

## Decide a run started by a job

A [cron schedule](../cron-schedules/) or a [webhook](../webhooks/) runs its workflow in a queue worker. The job value reports the `runId`, pending `pauses` and effective checkpoint `version`, which adds a digest of the job input.

Submit decisions with `checkpoint: { store, runId, version }` from that value: see [Job queues and workers](../job-queues/).

## Limits

- A gate takes no condition, retry, timeout or cache.
- A queued workflow job takes no decisions: call `start()` outside the worker.
- Signatures do not protect the checkpoint: anyone who can write its store is trusted.
- A custom `decisionVerifier` must check the signature, actor and expiry itself.
- For questions the agent asks while working, use [interactive tasks](../interactive-tasks/).

API: [defineApprovalTask](../../reference/defineapprovaltask/) · [definePauseTask](../../reference/definepausetask/) · [WorkflowDecision](../../reference/workflowdecision/) · [signWorkflowDecision](../../reference/signworkflowdecision/) · [createEd25519DecisionVerifier](../../reference/createed25519decisionverifier/) · [WorkflowApproverKey](../../reference/workflowapproverkey/).
