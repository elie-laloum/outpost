---
title: "Wait for approval"
description: "Pause a workflow until an authorized person accepts or rejects the next step."
---

Save the four files below together and run `node release.ts` in an ESM project with Outpost installed. This offline demonstration submits a sample decision immediately; replace that submission with your authenticated user’s decision in an application. It does not deploy a service.

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
import { workflow, deploy } from "./release-tasks.ts";
import { checkpoint } from "./release-checkpoint.ts";
import { releaseDecision } from "./release-decision.ts";

export const paused = await workflow.start({ checkpoint });
export const request = paused.tasks.find(
  (task) => task.key === "approve",
)?.pause;
console.log(paused.status, request?.prompt);
// Example output: paused Deploy release 1.4 to production?
if (!request) throw new Error("No approval is pending");
export const result = await workflow.start({
  checkpoint,
  decisions: [releaseDecision(paused.executionId, request.id)],
});
console.log(result.status, result.value(deploy));
// Example output: done Deployed, approved by maintainer
```

<!-- check:run -->

It prints `paused Deploy release 1.4 to production?`, then `done Deployed, approved by maintainer`.

A gate needs a checkpoint, the saved state of the run under `.outpost/storage`. The second `start()` can run in another process, days later.

## Submit a decision

<!-- canvas -->

- **Request**: Save the gate and wait for an authorized person.
  - Workflow
  - → **Decision**: request ready
- **Decision**: Your application submits the choice and reason.
  - Your application
  - → **Continue**: approved
  - → **Stop**: rejected
- **Continue**: Run dependent tasks.
  - Workflow
- **Stop**: Skip dependent tasks; the run is rejected.
  - Workflow

The rejection and its reason survive checkpoint resumption. Independent branches still follow normal scheduling; if one fails technically, the workflow returns `failed` with that failure’s termination code.

API reference: [WorkflowDecision](../../reference/workflowdecision/).

`start()` throws, applying no decision, when one does not match the pending request.

## Pause without approving

`definePauseTask()` takes the same options and holds the run until someone lets it go on, for example after a maintenance window. Continue with `action: "resume"` or stop with `"reject"`.

## Authenticate the actor

Outpost checks that `actor` is listed in `actors`, not who the person is. Log the person in and check their right to decide before you call `start()`.

Asking an agent in its brief to wait for approval is not a gate: only a gate task stops the run.

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

## Next steps

- [Require signed decisions](../signed-approvals/)

<!-- Retained section anchors for existing bookmarks. -->

<span id="require-a-signed-decision"></span>
<span id="rotate-approver-keys"></span>
