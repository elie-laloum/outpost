---
title: "Save and resume a workflow"
description: "Use checkpoints to resume a workflow and explicitly retry interrupted tasks."
---

Start with the offline example below to see a completed task reused after a restart. You need Node.js, Outpost and a writable storage directory. When adding real agent tasks, keep their workspaces available as well as the checkpoint.

## Save progress

Pass a `checkpoint` to the workflow’s `start()` method when you need to continue in a later process. Outpost saves task transitions and results under the checkpoint’s `runId`.

```ts
import {
  createLocalTransport,
  defineTask,
  defineWorkflow,
  createWorkflowCheckpointStore,
} from "@elie-laloum/outpost";

const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
const scan = defineTask({ key: "scan", perform: () => ({ files: 12 }) });
const result = await defineWorkflow("scan", [scan]).start({
  checkpoint: { store, runId: "scan-2026-09", version: "1" },
});
result.unwrap();
console.log(result.value(scan));
// Example output: { files: 12 }
```

<!-- check:run -->

It prints `{ files: 12 }` and saves the checkpoint under `.outpost/storage`. Run it again: `scan` does not run, its value comes from the checkpoint.

<!-- features -->

- **Task records**: Status, attempts, errors, gate requests and decisions of every task.
- **Outputs**: The value of each `done` task, restored instead of running it again.
- **Usage**: Cumulative attempts and tokens, so a [budget](../budgets/) spans every resume.

A resumed run keeps its `executionId` and each task’s `context.idempotencyKey`. To resume, call `start()` on the same workflow definition. The checkpoint stores state and outputs; it does not save sandbox instances, their files or task code.

## Return JSON outputs

A checkpointed task must return `undefined` or a value that survives JSON serialization without losing information. Otherwise the attempt fails. Convert dates to strings and return only the fields you need.

A dispatch result carries methods such as `resume()`. Project it in a `defineTask`, as shown below:

```ts
import { defineIsolatedTask, defineTask } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const agent = defineIsolatedTask({
  key: "fix-agent",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: "Fix the failing tests and commit the fix." },
  }),
});
export const fix = defineTask({
  key: "fix",
  perform: async (context) => {
    const { branch, commits } = await agent.perform(context);
    return { branch, commits, finishedAt: new Date().toISOString() };
  },
});
```

A checkpoint is limited to 16 MiB. Store large payloads as [artifacts](../artifacts/) and return their reference.

## Keep the checkpoint identity

A checkpoint only resumes the workflow that wrote it. `start()` rejects a checkpoint whose identity differs.

| Part of the identity | Where you set it                                                             |
| -------------------- | ---------------------------------------------------------------------------- |
| Workflow name        | `defineWorkflow(name, tasks)`                                                |
| Version              | `checkpoint.version`                                                         |
| Graph                | Task keys and their `after` dependencies                                     |
| Execution settings   | `timeoutMs`, `retry` settings, whether `condition` or `retry.accepts` is set |
| Gates                | Kind, `prompt`, `actors` and `authentication` of each approval or pause      |
| Loop tasks           | `maxRounds`                                                                  |
| Interactive tasks    | `actors`, agent, model, brief, repository, `maxTurns` and sandbox provider   |

Other task code, briefs and workflow inputs are not part of it: change `version` when you change them. A saved run cannot move to another identity, including a new `version`: start it again under a new `runId`.

The workflow `budget` is not part of the identity either.

To reuse results across different runs, use the [result cache](../task-cache/) instead.

## Resume incomplete work

A run that ended with a failed, cancelled or interrupted task resumes only with `resume: "retry-incomplete"`. This authorizes running those tasks again, with their side effects.

<!-- tabs -->

```ts title="upload-store.ts"
import {
  createWorkflowCheckpointStore,
  createLocalTransport,
} from "@elie-laloum/outpost";

export const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
```

```ts title="upload.ts"
import { defineTask } from "@elie-laloum/outpost";

export let calls = 0;
export const upload = defineTask({
  key: "upload",
  perform: () => {
    calls += 1;
    if (calls === 1) throw new Error("Network unavailable");
    return { uploaded: true };
  },
});
export function uploadCount() {
  return calls;
}
```

```ts title="resume-upload.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { upload } from "./upload.ts";
import { store } from "./upload-store.ts";

export const workflow = defineWorkflow("upload", [upload]);
export const checkpoint = { store, runId: "upload-1", version: "1" };
console.log((await workflow.start({ checkpoint })).status);
// Example output: failed
export const resumed = await workflow.start({
  checkpoint: { ...checkpoint, resume: "retry-incomplete" },
});
console.log(resumed.status);
// Example output: done
```

<!-- check:run -->

It prints `failed`, then `done`. Without `resume`, the second `start()` rejects.

| Saved state                                 | Without `resume`                         | With `resume: "retry-incomplete"`  |
| ------------------------------------------- | ---------------------------------------- | ---------------------------------- |
| Every task `done` or `skipped`              | Returns the saved result, runs nothing   | Same                               |
| Paused at a gate or waiting for an answer   | Continues with your decisions or answers | Same                               |
| Paused by a [quota](../quota-pauses/)       | Runs the task again after its reset      | Same                               |
| A task `failed`, `cancelled` or interrupted | `start()` rejects                        | Reruns it and the tasks it skipped |

Rerun tasks start a new series of `retry` attempts. `done` tasks never run again. A run stopped by its [budget](../budgets/) resumes the same way; pass a larger `budget`, since usage keeps adding up.

<span id="recover-a-run-after-a-crash"></span>

For this step, follow [Recover a workflow after a crash](../recovering-workflows/).

## Resume a run from a queue job

[`defineWorkflowJob()`](../job-queues/) runs each job under its `runId`. A queue returns the existing job for an ID it already has, so a finished job never runs again.

To continue the run, enqueue a new job ID with the same `runId` and the same `input`:

```ts
import { createSqliteTaskQueue } from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
try {
  await queue.enqueue({
    id: "fix-42-resume-1",
    handler: "fix",
    input: { runId: "fix-42", input: { issue: 42 } },
  });
} finally {
  queue.close();
}
```

A different `input` changes the checkpoint version and the job fails. To replay failed or interrupted tasks, the handler needs `checkpoint: { store, version, resume: "retry-incomplete" }`.

## Store checkpoints remotely

The store accepts any `Transport`. Use an S3 or R2 transport so that workers on several machines share runs: see [Where data lives](../storage/).

## Limits

- One `start()` at a time per `runId`. A second one rejects while the first runs.
- Ownership never expires on its own. Clear it with `recoverWorkflowCheckpoint()` after stopping the old runner.
- Replay repeats side effects that an interrupted task already made. Deduplicate them with `context.idempotencyKey`: see [Job queues and workers](../job-queues/).

API: [createWorkflowCheckpointStore](../../reference/createworkflowcheckpointstore/) · [WorkflowCheckpointOptions](../../reference/workflowcheckpointoptions/) · [recoverWorkflowCheckpoint](../../reference/recoverworkflowcheckpoint/) · [WorkflowCheckpoint](../../reference/workflowcheckpoint/) · [defineWorkflowJob](../../reference/defineworkflowjob/).
