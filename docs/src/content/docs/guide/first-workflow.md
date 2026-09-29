---
title: "From a task to a workflow"
description: "Turn one agent task into a workflow that fixes code on a branch, summarises the result, waits for an approval and resumes from a checkpoint."
---

<!-- flow -->

1. **First run**: Stops at the approval.
   - `fix`: The agent fixes the tests on a branch.
     - `defineIsolatedTask()`
   - `summary`: Keeps typed data from the result.
     - `defineTask()`
   - `approve`: Pauses the run for a decision.
     - `defineApprovalTask()`
2. **Second run**: Resumes with the decision.
   - `report`: Runs once approved.
     - `defineTask()`

A workflow is a graph of tasks. Each step replaces `fix.mts`, next to the `outpost.config.mts` from [Setup](../setup/).

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

It prints `outpost/fix-tests` and the agent’s commits. `defineIsolatedTask()` runs a `dispatch()` as a task, in its own sandbox. `unwrap()` throws unless the run’s `status` is `"done"`.

## Pass the result to another task

```ts title="fix.mts" ins={3,18-25,27,29}
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

It prints `{ branch: 'outpost/fix-tests', commits: 1 }`. `after: [fix]` starts `summary` once `fix` succeeds, and `context.value(fix)` reads its typed output. [Tasks and dependencies](../task-dependencies/) covers failures and concurrency.

## Wait for an approval

```ts title="fix.mts" ins={2-4,11-12,21-27,36-47,49-72}
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

It prints `paused`. The `approve` gate stops the run until an actor listed in `actors` decides; its task record holds the request in `pause`.

A gate needs a **checkpoint**, the saved statuses, outputs and usage of a run, here under `.outpost/storage`. Change `version` when you change the tasks.

Checkpoints hold JSON, not the methods of a dispatch result. `fix` therefore calls `agent.perform(context)` and keeps only `branch` and `commits`.

## Resume with the decision

```sh
node fix.mts approve
```

It prints `done` and `maintainer approved outpost/fix-tests`. `fix` and `summary` come from the checkpoint: only `report` runs.

| Decision field | Value                       |
| -------------- | --------------------------- |
| `executionId`  | `result.executionId`        |
| `key`          | `"approve"`, the gate’s key |
| `requestId`    | `pause.id`                  |
| `actor`        | One of the gate’s `actors`  |
| `reason`       | A nonempty explanation      |
| `action`       | `"approve"` or `"reject"`   |

:::caution
Authenticate the person before you submit their `actor`: see [Approvals](../approvals/). A task interrupted mid-run replays only once you authorize it: see [Durable runs](../durable-runs/).
:::

## Next steps

<!-- features -->

- [Tasks and dependencies](../task-dependencies/): Shape the graph and run tasks in parallel.
- [Verification loops](../verification-loops/): Retry with the test output as feedback.
- [Approvals](../approvals/): Authenticate approvers and sign decisions.
- [Durable runs](../durable-runs/): Authorize replays and recover crashed runs.
- [Quota pauses](../quota-pauses/): Pause when the agent hits a usage limit.
- [Job queues and workers](../job-queues/): Run workflows unattended.
