---
title: "Connect tasks and dependencies"
description: "Define tasks, declare what they depend on and read their typed results."
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="connect-the-steps"></span>
<span id="check-a-tasks-result"></span>
<span id="pick-a-task-type"></span>

The first example runs entirely in Node.js: install Outpost in an ESM project, save it as `dependencies.ts` and run `node dependencies.ts`. No agent, account or sandbox is needed to learn the graph.

## Define tasks and a workflow

Declare each step with a task constructor, then give the tasks to `defineWorkflow()`. Dependencies determine execution order and which earlier results a task may read.

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
// Example output: { reviewed: 1 }
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
// Example output: failed
for (const task of result.tasks)
  console.log(task.key, task.status, task.error ?? "");
// Example output: lint failed 2 lint errors
```

<!-- check:run -->

It prints `failed`, then `lint failed 2 lint errors` and `test cancelled`: by default, the first failure cancels the tasks that have not finished.

API reference: [WorkflowResult](../../reference/workflowresult/) and [TaskRecord](../../reference/taskrecord/).

## Run tasks in parallel

Independent tasks can run together when you increase `concurrency`. Start with the [parallelism and retries guide](../concurrency-and-retries/) for a working example. Tasks that share a sandbox must remain sequential; connect them with `after`.

## Skip a task

Use `condition` when a task only makes sense for some inputs. A false condition skips the task and its dependents, and produces no value. See the [conditional task example](../concurrency-and-retries/#skip-a-task-with-a-condition) before reading such a result.

## Display the dependencies

`diagram()` returns the graph as a Mermaid flowchart, for a README or a pull request.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const lint = defineTask({ key: "lint", perform: () => 0 });
const report = defineTask({ key: "report", after: [lint], perform: () => 0 });
console.log(defineWorkflow("checks", [lint, report]).diagram());
// Example output: flowchart LR
```

<!-- check:run -->

```text
flowchart LR
  n0["lint"]
  n1["report"]
  n0 --> n1
```

<span id="share-a-sandbox-between-tasks"></span>

To run tasks against the same files, follow [Share a sandbox](../sandbox-sessions/#share-a-sandbox-between-tasks).

## Choose the task type

Start with the declaration that matches who owns the work.

| Your step needs                        | Use                                                                                                            |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Your own function                      | [defineTask](../../reference/definetask/)                                                                      |
| An agent with its own sandbox          | [defineIsolatedTask](../../reference/defineisolatedtask/)                                                      |
| An agent or command in an open sandbox | [defineAgentTask](../../reference/defineagenttask/) or [defineCommandTask](../../reference/definecommandtask/) |
| Another attempt after a failed check   | [A verification loop](../verification-loops/)                                                                  |

Add [approvals](../approvals/), [human questions](../interactive-tasks/), [queued work](../job-queues/) or [artifacts](../artifacts/) when those steps become necessary.

:::caution
Agent dispatch results contain methods and cannot be checkpointed directly. For a durable run, call the agent from a task that returns a JSON projection and reports its usage, as shown in [Save and resume a workflow](../durable-runs/).
:::

## Limits

- Outputs live in memory for one `start()`. A restarted run reruns every task unless you pass a [checkpoint](../durable-runs/).
- Approval and pause tasks, interactive tasks, quota pauses, `answers` and `decisions` require a checkpoint: `start()` throws without one.
- A workflow does not commit, merge or push across tasks as one transaction. To change several repositories, see [Multiple repositories](../multiple-repositories/).

API: [defineTask](../../reference/definetask/) · [defineWorkflow](../../reference/defineworkflow/) · [TaskContext](../../reference/taskcontext/) · [WorkflowResult](../../reference/workflowresult/) · [TaskRecord](../../reference/taskrecord/) · [WorkflowFailure](../../reference/workflowfailure/)
