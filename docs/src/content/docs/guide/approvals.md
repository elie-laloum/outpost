---
title: "Wait for approval"
description: "Pause a workflow until an authorized person accepts or rejects the next step."
---

## Add a gate

Add an approval task before a step that needs a person’s agreement, such as a merge or deployment. The workflow pauses at that task; dependent tasks wait until an allowed actor approves.

<!-- tabs -->

```ts title="release-tasks.ts"
import {
  defineApprovalTask,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";

export const approve = defineApprovalTask({
  key: "approve",
  prompt: "Deploy release 1.4 to production?",
  actors: ["maintainer"],
});
export const deploy = defineTask({
  key: "deploy",
  after: [approve],
  perform: (context) => `Deployed, approved by ${context.value(approve).actor}`,
});
export const workflow = defineWorkflow("release", [approve, deploy]);
```

```ts title="release-checkpoint.ts"
import {
  createWorkflowCheckpointStore,
  createLocalTransport,
} from "@elie-laloum/outpost";

export const checkpoint = {
  store: createWorkflowCheckpointStore({
    transporter: createLocalTransport({ directory: ".outpost/storage" }),
  }),
  runId: "release-1.4",
  version: "1",
};
```

```ts title="release-decision.ts"
import type { WorkflowDecision } from "@elie-laloum/outpost";

export function releaseDecision(
  executionId: string,
  requestId: string,
): WorkflowDecision {
  return {
    executionId,
    key: "approve",
    requestId,
    actor: "maintainer",
    reason: "Release notes and staging checks reviewed",
    action: "approve",
  };
}
```

```ts title="release.ts"
import { reportValue } from "./reporter.ts";
import { workflow, deploy } from "./release-tasks.ts";
import { checkpoint } from "./release-checkpoint.ts";
import { releaseDecision } from "./release-decision.ts";

export const paused = await workflow.start({ checkpoint });
export const request = paused.tasks.find(
  (task) => task.key === "approve",
)?.pause;
reportValue(paused.status, request?.prompt);
// Example output: paused Deploy release 1.4 to production?
if (!request) throw new Error("No approval is pending");
export const result = await workflow.start({
  checkpoint,
  decisions: [releaseDecision(paused.executionId, request.id)],
});
reportValue(result.status, result.value(deploy));
// Example output: done Deployed, approved by maintainer
```

<!-- check:run -->

It prints `paused Deploy release 1.4 to production?`, then `done Deployed, approved by maintainer`.

A gate needs a checkpoint, the saved state of the run under `.outpost/storage`. The second `start()` can run in another process, days later.

## Submit a decision

<!-- canvas -->

- **Pause**: The run stops at the gate.
  - Steps
  - **Save the request**: The gate’s record holds it in `pause`: `id`, `prompt`, `actors`.
  - **Return**: Status `paused`, once independent tasks have finished.
  - → **Decide**: then
- **Decide**: In your application.
  - Steps
  - **Show the request**: To a person listed in `actors`.
  - **Submit**: `start()` with the same checkpoint and `decisions`.
  - → **Continue**: then
- **Continue**: According to `action`.
  - Steps
  - **Approve**: Dependent tasks run and read the decision as the gate’s value.
  - **Reject**: Dependent tasks are skipped and the run ends `failed`.

API reference: [WorkflowDecision](../../reference/workflowdecision/).

`start()` throws, applying no decision, when one does not match the pending request.

## Pause without approving

`definePauseTask()` takes the same options and holds the run until someone lets it go on, for example after a maintenance window. Continue with `action: "resume"` or stop with `"reject"`.

## Authenticate the actor

Outpost checks that `actor` is listed in `actors`, not who the person is. Log the person in and check their right to decide before you call `start()`.

Asking an agent in its brief to wait for approval is not a gate: only a gate task stops the run.

## Require a signed decision

With `authentication: "signed"` on the gate, a decision needs an Ed25519 signature from a key bound to its actor. Only your signing service holds private keys; keep them out of worker sandboxes.

<!-- tabs -->

```ts title="sign.ts"
import type { WorkflowDecision } from "@elie-laloum/outpost";
import type { KeyObject } from "node:crypto";
import { signWorkflowDecision } from "@elie-laloum/outpost";

export function sign(decision: WorkflowDecision, privateKey: KeyObject) {
  return signWorkflowDecision({
    decision,
    privateKey,
    keyId: "maintainer-2026",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  });
}
```

```ts title="submission.types.ts"
import type {
  Workflow,
  WorkflowCheckpointOptions,
  WorkflowDecision,
  WorkflowApproverKey,
} from "@elie-laloum/outpost";

export interface SignedSubmission {
  workflow: Workflow;
  checkpoint: WorkflowCheckpointOptions;
  signed: WorkflowDecision;
  keys: () => Promise<readonly WorkflowApproverKey[]>;
}
```

```ts title="submit.ts"
import type { SignedSubmission } from "./submission.types.ts";
import { createEd25519DecisionVerifier } from "@elie-laloum/outpost";

export function submit({
  workflow,
  checkpoint,
  signed,
  keys,
}: SignedSubmission) {
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

<!-- canvas -->

- **Add**: Publish the new public key.
  - Steps
  - **Bind it**: A new `keyId` for the same actor, next to the old key.
  - → **Switch**: then
- **Switch**: Sign with the new private key.
  - Steps
  - **Overlap**: Both keys verify decisions still in flight.
  - → **Remove**: then
- **Remove**: Drop the old public key.
  - Steps
  - **Revoke**: Its new proofs fail; recorded approvals stay valid.

`keys` runs for every signed decision, so changes apply without a restart.

## Decide a run started by a job

A [cron schedule](../cron-schedules/) or a [webhook](../webhooks/) runs its workflow in a queue worker. The job value reports the `runId`, pending `pauses` and effective checkpoint `version`, which adds a digest of the job input.

Submit decisions with `checkpoint: { store, runId, version }` from that value: see [Job queues and workers](../job-queues/).

## Limits

- A gate takes no condition, retry, timeout or cache.
- A queued workflow job takes no decisions: call `start()` outside the worker.
- Changing a gate’s `prompt`, `actors` or `authentication` makes a paused run’s checkpoint incompatible: resume it with the unchanged gate.
- Signatures do not protect the checkpoint: anyone who can write its store is trusted.
- A custom `decisionVerifier` must check the signature, actor and expiry itself.
- For questions the agent asks while working, use [interactive tasks](../interactive-tasks/).

API: [defineApprovalTask](../../reference/defineapprovaltask/) · [definePauseTask](../../reference/definepausetask/) · [WorkflowDecision](../../reference/workflowdecision/) · [signWorkflowDecision](../../reference/signworkflowdecision/) · [createEd25519DecisionVerifier](../../reference/createed25519decisionverifier/) · [WorkflowApproverKey](../../reference/workflowapproverkey/).
