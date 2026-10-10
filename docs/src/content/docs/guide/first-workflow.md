---
title: "Your first workflow"
description: "Connect an agent task to a function and inspect their typed result."
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="connect-two-tasks"></span>
<span id="run-the-script"></span>
<span id="read-the-dependencies-and-results"></span>
<span id="add-a-check-when-you-need-one"></span>

## Pass an agent’s answer to your code

After [your first task](../first-request/), add a second step that reads its result. This lesson uses the same committed README and [configuration](../setup/); it does not need failing tests or a checkpoint.

Save these three files beside `outpost.config.ts`. The first declares the agent task, the second builds a summary, and the last starts the workflow.

<!-- tabs -->

```ts title="review-task.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export const review = defineIsolatedTask({
  key: "review",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/workflow-review" },
    brief: { text: "Summarize the README setup steps without editing files." },
  }),
});
```

```ts title="summary.ts"
import { defineTask } from "@elie-laloum/outpost";
import { review } from "./review-task.ts";

export const summary = defineTask({
  key: "summary",
  after: [review],
  perform: (context) => ({
    text: context.value(review).text,
    branch: context.value(review).branch,
    commits: context.value(review).commits.length,
  }),
});
```

```ts title="workflow.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { review } from "./review-task.ts";
import { summary } from "./summary.ts";

const result = await defineWorkflow("readme-review", [review, summary]).start();
result.unwrap();
console.log(result.value(summary));
// Example output: { text: 'Install ...', branch: 'outpost/workflow-review', commits: 0 }
```

## Run the workflow

The agent reads the README first. If that task succeeds, your `summary` function runs and the script prints its result.

```sh
node workflow.ts
```

Inspect the answer, branch name and commit count. `unwrap()` throws if the workflow did not succeed, so the script does not print a successful summary after a failed task. This example asks for no edits and never integrates the branch.

## Understand the dependency

`after: [review]` makes `summary` wait and lets it read `context.value(review)` with the correct TypeScript type. Neither task starts when declared: `.start()` runs the graph. The isolated task opens and closes its own sandbox; your summary runs in the Node.js process.

This run keeps its outputs in memory. A checkpointed workflow needs JSON outputs from every stored task, including the agent step: follow [Save and resume a workflow](../durable-runs/) when you need that behavior.

## Build on the two steps

[Tasks and dependencies](../task-dependencies/) covers other task types and results. Use a [verification loop](../verification-loops/) when a real test must accept the work, and [offline workflow tests](../testing-workflows/) to exercise your control flow without model calls.

API: [defineIsolatedTask](../../reference/defineisolatedtask/) · [defineTask](../../reference/definetask/) · [defineWorkflow](../../reference/defineworkflow/).
