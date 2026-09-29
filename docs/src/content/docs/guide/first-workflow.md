---
title: "From a task to a workflow"
description: "Turn one agent task into a workflow that fixes code on a branch, summarises the result, waits for an approval and resumes from a checkpoint."
---

Turn the single `dispatch()` from [Your first task](../first-request/) into a workflow: an agent fixes the failing tests on a branch, a second task summarises its result as typed data, a maintainer approves it and a checkpoint lets the run stop and resume without repeating finished work.

A workflow is a named graph of tasks. Each step below replaces the content of one file, `fix.mts`, next to the `outpost.config.mts` from [Setup](../setup/).

## Run the agent as a workflow task

```ts title="fix.mts"
import { defineIsolatedTask, defineWorkflow } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const fix = defineIsolatedTask({
  key: "fix",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/fix-tests" },
    brief: { text: "Fix the failing tests, run them and commit the fix." },
  }),
});

const result = await defineWorkflow("fix-tests", [fix]).start();
result.unwrap();
const { branch, commits } = result.value(fix);
console.log(branch, commits);
```

```sh
node fix.mts
```

`defineIsolatedTask()` declares a task whose `request` returns the options of a `dispatch()`. Each attempt allocates its own sandbox and closes it when the agent finishes; cancelling the workflow stops the agent.

`defineWorkflow()` checks the graph and `start()` runs it. A failed task does not make `start()` throw: the result carries a `status`, and `unwrap()` throws unless it is `"done"`. `result.value(fix)` is the task’s typed dispatch result. The script prints `outpost/fix-tests` and the commits the agent made.

## Pass the result to another task

```ts title="fix.mts"
import {
  defineIsolatedTask,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const fix = defineIsolatedTask({
  key: "fix",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/fix-tests" },
    brief: { text: "Fix the failing tests, run them and commit the fix." },
  }),
});
const summary = defineTask({
  key: "summary",
  after: [fix],
  perform: (context) => ({
    branch: context.value(fix).branch,
    commits: context.value(fix).commits.length,
  }),
});

const result = await defineWorkflow("fix-tests", [fix, summary]).start();
result.unwrap();
console.log(result.value(summary));
```

`after: [fix]` makes `summary` wait for `fix` to succeed, and `context.value(fix)` reads its output with its type. The script prints, for example, `{ branch: 'outpost/fix-tests', commits: 1 }`.

Tasks and their `after` lists form a graph. A task starts once all its dependencies are done and is skipped if one of them fails. Tasks without a path between them are independent: `start({ concurrency: 2 })` runs up to two at the same time; the default is one. [Tasks and dependencies](../task-dependencies/) covers the graph in detail.

## Wait for an approval

```ts title="fix.mts"
import {
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineApprovalTask,
  defineIsolatedTask,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const agent = defineIsolatedTask({
  key: "fix-agent",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/fix-tests" },
    brief: { text: "Fix the failing tests, run them and commit the fix." },
  }),
});
const fix = defineTask({
  key: "fix",
  perform: async (context) => {
    const { branch, commits } = await agent.perform(context);
    return { branch, commits };
  },
});
const summary = defineTask({
  key: "summary",
  after: [fix],
  perform: (context) => ({
    branch: context.value(fix).branch,
    commits: context.value(fix).commits.length,
  }),
});
const approve = defineApprovalTask({
  key: "approve",
  after: [summary],
  prompt: "Merge outpost/fix-tests?",
  actors: ["maintainer"],
});
const report = defineTask({
  key: "report",
  after: [summary, approve],
  perform: (context) =>
    `${context.value(approve).actor} approved ${context.value(summary).branch}`,
});

const workflow = defineWorkflow("fix-tests", [fix, summary, approve, report]);
const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
const checkpoint = { store, runId: "fix-tests-1", version: "1" };

let result = await workflow.start({ checkpoint });
const pending = result.tasks.find((task) => task.key === "approve")?.pause;
if (pending && process.argv[2] === "approve")
  result = await workflow.start({
    checkpoint,
    decisions: [
      {
        executionId: result.executionId,
        key: "approve",
        requestId: pending.id,
        actor: "maintainer",
        reason: "Reviewed the branch and the test run",
        action: "approve",
      },
    ],
  });
console.log(result.status);
if (result.status === "done") console.log(result.value(report));
```

```sh
node fix.mts
```

`defineApprovalTask()` is a gate: once `summary` is done, the run stops until an actor listed in `actors` approves or rejects. `report` runs only after an approval; a rejection skips it. The script prints `paused`: `start()` returned `status: "paused"`, and the `approve` task record holds the pending request in `pause`.

A gate needs a checkpoint, because the pending request must outlive the process. A checkpoint is the saved state of a run: task statuses, outputs and usage. `createWorkflowCheckpointStore()` keeps it under the `runId` in `.outpost/storage`. `version` is part of its identity: change it when you change the tasks or their inputs.

Checkpoints store task outputs as JSON. A dispatch result also carries `resume()` and `fork()` methods, so `fix` now runs the isolated task through its `perform(context)` and keeps only `branch` and `commits`.

## Resume with the decision

```sh
node fix.mts approve
```

The script first starts the workflow to read the pending request, then starts it again with a decision. The decision names the run (`executionId`), the gate (`key`), the exact request (`requestId`, the `pause.id`), the `actor`, a `reason` and the `action`: `"approve"` or `"reject"`. The script prints `done` and `maintainer approved outpost/fix-tests`.

`fix` and `summary` are restored from the checkpoint, not run again: no sandbox starts and the agent is not called. Only `report` runs.

Before relying on this:

- `actor` is metadata your application supplies. Authenticate the person before you submit a decision: see [Approvals](../approvals/).
- If the process stops while a task is running, the next `start()` refuses to replay that task until you authorize it: see [Durable runs](../durable-runs/).

## Next steps

- Retry the fix with the test output as feedback: [Verification loops](../verification-loops/).
- Pause instead of failing when the agent reaches a usage limit: [Quota pauses](../quota-pauses/).
- Run the workflow unattended: [Job queues and workers](../job-queues/), [Cron schedules](../cron-schedules/) or [Webhooks](../webhooks/).
- Require a signed decision from the approver: [Approvals](../approvals/).
- Retry interrupted tasks and recover a crashed run: [Durable runs](../durable-runs/).
