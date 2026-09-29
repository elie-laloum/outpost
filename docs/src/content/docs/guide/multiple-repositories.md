---
title: "Multiple repositories"
description: "Give each repository its own task and sandbox, run them side by side, and pass one repository’s result to the next."
---

## Run one task per repository

A sandbox owns one repository. To change several, define one `defineIsolatedTask()` per checkout and start them in the same workflow.

```ts
import { resolve } from "node:path";
import { defineIsolatedTask, defineWorkflow } from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.mts";

function upgrade(key: string, path: string) {
  return defineIsolatedTask({
    key,
    request: () => ({
      repository: resolve(import.meta.dirname, path),
      sandboxProvider,
      agent: coder,
      branch: { mode: "named", name: "outpost/node-24" },
      brief: {
        text: "Move CI and package.json to Node.js 24, run the tests and commit.",
      },
    }),
  });
}
const api = upgrade("api", "../api");
const web = upgrade("web", "../web");

const result = await defineWorkflow("node-24", [api, web]).start({
  concurrency: 2,
});
result.unwrap();
console.log(result.value(api).commits.length, result.value(web).commits.length);
```

It prints the number of commits on `outpost/node-24` in each checkout. Each task opens its own worktree and sandbox, and closes them when it ends.

`concurrency` defaults to `1`: without it, the repositories run one after the other. Paths resolve from `import.meta.dirname`, so the script runs from any directory.

## Pass one repository’s result to another

Add the first task to `after`, then read its result with `context.value()` in `request`. The client starts once the API task succeeds.

```ts
import { resolve } from "node:path";
import { defineIsolatedTask, defineWorkflow } from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.mts";

const branch = { mode: "named", name: "outpost/rename-field" } as const;
const api = defineIsolatedTask({
  key: "api",
  request: () => ({
    repository: resolve(import.meta.dirname, "../api"),
    sandboxProvider,
    agent: coder,
    branch,
    brief: {
      text: "Rename user_name to username in GET /users, commit, and describe the change.",
    },
  }),
});
const web = defineIsolatedTask({
  key: "web",
  after: [api],
  request: (context) => ({
    repository: resolve(import.meta.dirname, "../web"),
    sandboxProvider,
    agent: coder,
    branch,
    brief: {
      text: `The API changed:\n${context.value(api).text}\nUpdate this client and commit.`,
    },
  }),
});

const result = await defineWorkflow("rename-field", [api, web]).start();
result.unwrap();
```

The dependency orders the tasks. Each repository keeps its own branch and history.

## When one repository fails

A task failure does not undo the others. By default, the first failure stops the run; `stopOnError: false` lets independent repositories finish.

| What happened                            | What you do                                                                                                                                  |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| A task is `failed`                       | Read `task.error` in `result.tasks`. Its worktree stays under `.outpost/workspaces/` in that checkout, with the agent’s work.                |
| Other tasks are `cancelled`              | They were running or waiting when the first failure stopped the run. Their worktrees stay too. Pass `stopOnError: false` to let them finish. |
| A dependent task is `skipped`            | It never ran, because a task in its `after` did not succeed.                                                                                 |
| Some repositories are `done`, one is not | Their branches stay as they are. Keep them, or delete them yourself.                                                                         |
| You rerun the script after a fix         | Every task runs again, including those already `done`. A `named` branch reuses its retained worktree as it is.                               |

To rerun only the unfinished tasks, add a checkpoint: [Durable runs](../durable-runs/). [Recover work](../recovery/) inspects retained worktrees.

## Publish behind an approval

Outpost pushes nothing. Put the push or merge in a task placed after a [`defineApprovalTask()`](../approvals/) gate that lists every repository task in `after`.

A gate needs a checkpoint, and checkpoints hold JSON. Wrap each isolated task in a `defineTask()` that keeps `repository`, `branch` and `commits`. [Change several repositories](../multi-repository-change/) is the complete, gated example.

## Limits

- No Git operation spans repositories: there is no shared commit, rollback or push.
- An isolated task’s result is not JSON: it cannot be cached or checkpointed without a wrapper task.

API: [defineIsolatedTask](../../reference/defineisolatedtask/) · [defineWorkflow](../../reference/defineworkflow/) · [WorkflowOptions](../../reference/workflowoptions/) · [TaskContext](../../reference/taskcontext/) · [WorkflowResult](../../reference/workflowresult/).
