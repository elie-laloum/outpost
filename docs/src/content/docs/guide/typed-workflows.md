---
title: "Typed workflows"
description: "Chain tasks that hand each other typed results, loop until a check accepts the work, run independent branches in parallel and read every output from one result."
---

## From one task to a graph

A workflow is a list of tasks ordered by their dependencies. Each task returns a value, and the next task reads it with its type intact.

<!-- features -->

- [Tasks and dependencies](../task-dependencies/): Declare each step, connect the outputs, run the graph.
  - `defineTask()`
  - `defineWorkflow()`
- [Verification loops](../verification-loops/): Let the agent try again with the check's feedback until it passes.
  - `defineLoopTask()`
  - `maxRounds`
- [Typed responses](../typed-responses/): Ask the agent for a tagged JSON answer and validate it before using it.
  - `defineJsonResponse()`
  - `result.value`
- [Concurrency, retries and timeouts](../concurrency-and-retries/): Parallel branches, retries on failure and bounded durations.
  - `concurrency`
  - `retries`
- [Result cache](../task-cache/): Return a task's recorded value instead of running it again.
  - `cache`
  - `repositoryFingerprint()`
- [Artifacts](../artifacts/): Hand files, not just values, from one task to the next.
  - `defineJsonArtifact()`
  - digests

## Check before you keep the work

`defineTask()` prepares the input, `defineLoopTask()` repeats an attempt until its check accepts, and `defineWorkflow()` runs them in order.

```ts
import {
  defineLoopTask,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";

const plan = defineTask({
  key: "plan",
  perform: () => ({ files: ["src/parser.ts"] }),
});
const fix = defineLoopTask({
  key: "fix",
  after: [plan],
  maxRounds: 3,
  attempt: (context) => ({
    files: context.value(plan).files,
    round: context.round,
  }),
  check: (_, candidate) =>
    candidate.round === 2
      ? { done: true }
      : { done: false, feedback: "Cover the missing edge case." },
});

const result = await defineWorkflow("fix-parser", [plan, fix]).start();
result.unwrap();
console.log(result.value(fix)); // { files: [ 'src/parser.ts' ], round: 2 }
```

<!-- check:run -->

Nothing runs until `start()`. The first round is rejected, the second receives the feedback and is accepted, and `result.value(fix)` keeps the type returned by `attempt`.

## Pick a task type

| Task                   | Runs                                        | Returns                           |
| ---------------------- | ------------------------------------------- | --------------------------------- |
| `defineTask()`         | Your own function                           | Whatever it returns               |
| `defineAgentTask()`    | An agent on the shared workspace            | Its text, commits and typed value |
| `defineIsolatedTask()` | An agent in its own sandbox and worktree    | The same, per repository          |
| `defineLoopTask()`     | Attempt and check, until accepted           | The accepted candidate            |
| `defineApprovalTask()` | A [gate](../approvals/) waiting on a person | The recorded decision             |

Results are lossless JSON, so a [durable run](../durable-runs/) can stop between two tasks and resume where it left off.

## Limits

- `context.value()` throws for a task that is missing from `after`, even when it already ran.
- A task starts only once every task in its `after` list is done; a cycle or an unknown dependency is a configuration error at `start()`.
- A rejection in the last round fails the loop task with `LoopTaskExhausted`.
- Task values must survive a JSON round trip. Keep class instances, streams and handles out of them.
- A workflow does not push, merge or deploy anything by itself. Those steps stay in your tasks.

API: [defineTask](../../reference/definetask/) · [defineWorkflow](../../reference/defineworkflow/) · [defineLoopTask](../../reference/definelooptask/) · [TaskContext](../../reference/taskcontext/) · [WorkflowResult](../../reference/workflowresult/) · [WorkflowFailure](../../reference/workflowfailure/) · [defineJsonResponse](../../reference/definejsonresponse/).
