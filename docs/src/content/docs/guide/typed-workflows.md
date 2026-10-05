---
title: "Compose typed workflows"
description: "Connect task results and choose the task type that fits each step."
---

## Connect the steps

Use a workflow when your work has several steps with explicit dependencies. Each task returns a value, and tasks that depend on it can read that value with its TypeScript type preserved.

<!-- features -->

- [Tasks and dependencies](../task-dependencies/): Declare each step, connect the outputs, run the graph.
- [Verification loops](../verification-loops/): Let the agent try again with the check's feedback until it passes.
- [Typed responses](../typed-responses/): Ask the agent for a tagged JSON answer and validate it before using it.
- [Concurrency, retries and timeouts](../concurrency-and-retries/): Parallel branches, retries on failure and bounded durations.
- [Result cache](../task-cache/): Return a task's recorded value instead of running it again.
- [Artifacts](../artifacts/): Hand files, not just values, from one task to the next.
  - digests

## Check a task’s result

`defineTask()` prepares the input, `defineLoopTask()` repeats an attempt until its check accepts, and `defineWorkflow()` runs them in order.

<!-- tabs -->

```ts title="plan.ts"
import { defineTask } from "@elie-laloum/outpost";

export const plan = defineTask({
  key: "plan",
  perform: () => ({ files: ["src/parser.ts"] }),
});
```

```ts title="fix.ts"
import { defineLoopTask } from "@elie-laloum/outpost";
import { plan } from "./plan.ts";

export const fix = defineLoopTask({
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
```

```ts title="run.ts"
import { reportValue } from "./reporter.ts";
import { defineWorkflow } from "@elie-laloum/outpost";
import { plan } from "./plan.ts";
import { fix } from "./fix.ts";

export const result = await defineWorkflow("fix-parser", [plan, fix]).start();
result.unwrap();
reportValue(result.value(fix));
// Example output: { files: [ 'src/parser.ts' ], round: 2 }
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

For a [checkpointed workflow](../durable-runs/), return values that can be stored and restored as JSON without loss. A later process can then resume from the saved task results.

## Limits

- `context.value()` throws for a task that is missing from `after`, even when it already ran.
- A task starts only once every task in its `after` list is done; `defineWorkflow()` rejects cycles and unknown dependencies before execution.
- A rejection in the last round fails the loop task with `LoopTaskExhausted`.
- To save task results in a checkpoint, use values that can be restored from JSON without loss. Class instances, streams and handles do not meet this requirement.
- A workflow does not push, merge or deploy anything by itself. Those steps stay in your tasks.

API: [defineTask](../../reference/definetask/) · [defineWorkflow](../../reference/defineworkflow/) · [defineLoopTask](../../reference/definelooptask/) · [TaskContext](../../reference/taskcontext/) · [WorkflowResult](../../reference/workflowresult/) · [WorkflowFailure](../../reference/workflowfailure/) · [defineJsonResponse](../../reference/definejsonresponse/).
