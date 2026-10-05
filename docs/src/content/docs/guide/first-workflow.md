---
title: "Your first workflow"
description: "Run an agent task, pass its result to a second task and read the workflow’s output."
---

## Connect two tasks

A workflow describes tasks and the dependencies between them. In this example, an agent fixes the tests on a separate branch. A second task reads its result and returns a short summary.

Use the configuration from [Installation](../setup/) and save these three files next to it. Each tab shows one file: the agent task, the summary task and the script that runs them.

<!-- tabs -->

```ts title="fix-task.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export const fix = defineIsolatedTask({
  key: "fix",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/fix-tests" },
    brief: { text: "Fix the failing tests, run them and commit the fix." },
  }),
});
```

```ts title="summary.ts"
import { defineTask } from "@elie-laloum/outpost";
import { fix } from "./fix-task.ts";

export const summary = defineTask({
  key: "summary",
  after: [fix],
  perform: (context) => ({
    branch: context.value(fix).branch,
    commits: context.value(fix).commits.length,
  }),
});
```

```ts title="fix.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { fix } from "./fix-task.ts";
import { summary } from "./summary.ts";

export const result = await defineWorkflow("fix-tests", [fix, summary]).start();
result.unwrap();
console.log(result.value(summary));
```

## Run the script

The agent works on `outpost/fix-tests`. After it succeeds, the `summary` task returns the branch name and the number of commits. The exact commit count depends on the work the agent produced.

```sh
node fix.ts
```

Review the branch before merging it. A successful workflow means its tasks completed; this example does not independently check whether the tests pass.

## Read the dependencies and results

`defineIsolatedTask()` runs the agent in its own sandbox. `defineTask()` runs your function. Neither starts work until you call the workflow’s `start()` method.

`after: [fix]` tells `summary` to wait for `fix`. It also lets `summary` read the first task’s output with `context.value(fix)`; TypeScript keeps the value’s type.

`result.unwrap()` throws if the workflow did not finish successfully. After it returns, `result.value(summary)` gives you the summary. See [Connect tasks and dependencies](../task-dependencies/) for failures, skipped tasks and parallel execution.

## Add a check when you need one

To make test results decide whether work is accepted, add a [verification loop](../verification-loops/). To require a person’s decision, add an [approval task](../approvals/).

When the workflow needs to resume in a later process, [save its progress](../durable-runs/) with a checkpoint. You can add these features to the same task graph.

API: [defineIsolatedTask](../../reference/defineisolatedtask/) · [defineTask](../../reference/definetask/) · [defineWorkflow](../../reference/defineworkflow/).
