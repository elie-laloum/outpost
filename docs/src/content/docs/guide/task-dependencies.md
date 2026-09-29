---
title: "Tasks and dependencies"
description: "Declare tasks, connect their typed outputs into a graph, run it and read each task’s result."
---

## Define tasks and a workflow

A task is one step with a unique `key` and a `perform` function. A workflow is the list of tasks, ordered by their `after` dependencies.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const files = defineTask({ key: "files", perform: () => ["src/parser.ts"] });
const report = defineTask({
  key: "report",
  after: [files],
  perform: (context) => ({ reviewed: context.value(files).length }),
});
const result = await defineWorkflow("review", [files, report]).start();
result.unwrap();
console.log(result.value(report));
```

<!-- check:run -->

It prints `{ reviewed: 1 }`. `defineTask()` and `defineWorkflow()` only declare the graph: nothing runs until `start()`.

## Read a dependency

List a task in `after`, then read its output with `context.value(task)`. The value keeps the type returned by that task’s `perform`.

`context.value()` throws for a task missing from `after`, even if it already ran. A task starts only once every task in its `after` list is `done`.

## Fix graph errors

`defineWorkflow()` checks the graph before anything runs and throws on the first error.

| Mistake                                           | Error                                      |
| ------------------------------------------------- | ------------------------------------------ |
| Two tasks share a key                             | `Duplicate task: test`                     |
| A task in `after` is not in the workflow’s list   | `publish: missing dependency lint`         |
| Tasks depend on each other in a loop              | `Dependency cycle at report`               |
| A key does not match `[A-Za-z0-9][A-Za-z0-9._-]*` | `Invalid task key: …`, from `defineTask()` |

## Read the results

`start()` resolves with a `WorkflowResult` once no task can run any more, even when tasks failed. It rejects when an option is invalid or a checkpoint cannot be saved.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const lint = defineTask({
  key: "lint",
  perform: () => {
    throw new Error("2 lint errors");
  },
});
const test = defineTask({ key: "test", perform: () => "ok" });
const result = await defineWorkflow("checks", [lint, test]).start();
console.log(result.status);
for (const task of result.tasks)
  console.log(task.key, task.status, task.error ?? "");
```

<!-- check:run -->

It prints `failed`, then `lint failed 2 lint errors` and `test cancelled`: by default, the first failure cancels the tasks that have not finished.

| Member        | What it holds                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------- |
| `status`      | `"done"`, `"failed"`, `"cancelled"`, `"paused"` (a gate or quota pause) or `"waiting-input"`.                   |
| `unwrap()`    | Throws a [`WorkflowFailure`](../../reference/workflowfailure/) carrying the result unless `status` is `"done"`. |
| `value(task)` | The task’s output. Throws if the task did not finish with `done` in this run.                                   |
| `tasks`       | One record per task: `key`, `status`, `attempts`, `startedAt`, `finishedAt`, `error`.                           |
| `errors`      | The errors that failed the run.                                                                                 |
| `usage`       | Attempts made and tokens reported by agent tasks, summed over the run.                                          |

## Run tasks in parallel

`start()` runs one task at a time by default, in list order. Pass `concurrency` to run independent tasks together.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const lint = defineTask({ key: "lint", perform: () => ({ warnings: 0 }) });
const test = defineTask({ key: "test", perform: () => ({ failed: 0 }) });
const report = defineTask({
  key: "report",
  after: [lint, test],
  perform: (context) =>
    context.value(lint).warnings + context.value(test).failed === 0,
});
const result = await defineWorkflow("checks", [lint, test, report]).start({
  concurrency: 2,
});
result.unwrap();
console.log(result.value(report));
```

<!-- check:run -->

`lint` and `test` run together, then `report` prints `true`. Retries, timeouts and what a failure stops are on [Concurrency, retries and timeouts](../concurrency-and-retries/).

## Skip a task

`condition` runs before the task’s first attempt. When it returns `false`, the task ends as `skipped` without running.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const changes = defineTask({ key: "changes", perform: (): string[] => [] });
const review = defineTask({
  key: "review",
  after: [changes],
  condition: (context) => context.value(changes).length > 0,
  perform: (context) => `Reviewed ${context.value(changes).length} files`,
});
const result = await defineWorkflow("review", [changes, review]).start();
console.log(
  result.status,
  result.tasks.map((task) => task.status),
);
```

<!-- check:run -->

It prints `done [ 'done', 'skipped' ]`. A skipped task does not fail the run, has no value, and skips every task that depends on it.

## Draw the graph

`diagram()` returns the graph as a Mermaid flowchart, for a README or a pull request.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const lint = defineTask({ key: "lint", perform: () => 0 });
const report = defineTask({ key: "report", after: [lint], perform: () => 0 });
console.log(defineWorkflow("checks", [lint, report]).diagram());
```

<!-- check:run -->

```text
flowchart LR
  n0["lint"]
  n1["report"]
  n0 --> n1
```

## Share a sandbox between tasks

`defineAgentTask()` and `defineCommandTask()` run in a sandbox you opened with [`createSandbox()`](../sandbox-sessions/). The tasks share its files; you close it.

```ts
import {
  createSandbox,
  defineAgentTask,
  defineCommandTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
});
const fix = defineAgentTask({
  key: "fix",
  sandbox,
  request: () => ({ brief: { text: "Fix the failing date tests." } }),
});
const test = defineCommandTask({
  key: "test",
  after: [fix],
  sandbox,
  command: { executable: "npm", arguments: ["test"] },
});
const result = await defineWorkflow("fix-dates", [fix, test]).start();
result.unwrap();
```

`test` runs `npm test` on the agent’s edits. A nonzero exit status fails the task.

## Which task type?

Each declaration returns a task that you list in `defineWorkflow()` and connect with `after`.

| Declaration                                                                 | Use it for                                                        | Guide                                             |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------- |
| [`defineTask`](../../reference/definetask/)                                 | Your own code returning a value.                                  | This page                                         |
| [`defineIsolatedTask`](../../reference/defineisolatedtask/)                 | An agent task in its own sandbox, opened and closed by the task.  | [From a task to a workflow](../first-workflow/)   |
| [`defineAgentTask`](../../reference/defineagenttask/)                       | An agent turn in a sandbox you keep open.                         | [Share a sandbox](#share-a-sandbox-between-tasks) |
| [`defineCommandTask`](../../reference/definecommandtask/)                   | A command in a sandbox you keep open.                             | [Share a sandbox](#share-a-sandbox-between-tasks) |
| [`defineLoopTask`](../../reference/definelooptask/)                         | Attempts checked in rounds, with the failed check as feedback.    | [Verification loops](../verification-loops/)      |
| [`defineQueuedTask`](../../reference/definequeuedtask/)                     | Work handed to a worker through a job queue.                      | [Job queues and workers](../job-queues/)          |
| [`defineApprovalTask`](../../reference/defineapprovaltask/)                 | A pause until a listed person approves or rejects.                | [Approvals](../approvals/)                        |
| [`definePauseTask`](../../reference/definepausetask/)                       | A pause until a listed person resumes or rejects.                 | [Approvals](../approvals/)                        |
| [`defineInteractiveAgentTask`](../../reference/defineinteractiveagenttask/) | An agent dialogue that waits for human answers between turns.     | [Interactive tasks](../interactive-tasks/)        |
| [`defineArtifactTask`](../../reference/defineartifacttask/)                 | A value published as an artifact; dependents receive a reference. | [Artifacts](../artifacts/)                        |
| [`defineWorkflowJob`](../../reference/defineworkflowjob/)                   | Not a task: runs a whole workflow as a queue job.                 | [Job queues and workers](../job-queues/)          |

:::caution
`defineIsolatedTask()` and `defineAgentTask()` return a dispatch result with methods, which a checkpoint cannot store. In a checkpointed run, call them from a `defineTask()` that returns JSON, as in [From a task to a workflow](../first-workflow/). See [Durable runs](../durable-runs/).
:::

## Limits

- Outputs live in memory for one `start()`. A restarted run reruns every task unless you pass a [checkpoint](../durable-runs/).
- Approval and pause tasks, interactive tasks and quota pauses require a checkpoint: `start()` throws without one.
- A workflow does not commit, merge or push across tasks as one transaction. To change several repositories, see [Multiple repositories](../multiple-repositories/).

API: [defineTask](../../reference/definetask/) · [defineWorkflow](../../reference/defineworkflow/) · [TaskContext](../../reference/taskcontext/) · [WorkflowResult](../../reference/workflowresult/) · [TaskRecord](../../reference/taskrecord/) · [WorkflowFailure](../../reference/workflowfailure/)
