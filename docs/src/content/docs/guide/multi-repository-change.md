---
title: "Coordinate a change across repositories"
description: "Update an API and its clients, review each branch and approve their integration."
---

## What this example covers

<!-- features -->

- [Multiple repositories](../multiple-repositories/): One task per checkout, each with its own sandbox and branch.
- [Typed responses](../typed-responses/): The API agent returns a validated description of its change.
- [Tasks and dependencies](../task-dependencies/): The clients start after the API and read its output.
- [Concurrency, retries and timeouts](../concurrency-and-retries/): Both clients run at the same time.
- [Approvals](../approvals/): A maintainer decides before anything merges.
- [Durable runs](../durable-runs/): The checkpoint keeps finished work between runs.

## Write the script

Save the script next to the configuration from [Installation](../setup/), and replace its three repository paths with your checkouts. Each repository gets a separate branch; one approval controls the integration steps.

Define the API change and the output that the clients will receive.

<!-- tabs -->

```ts title="delivery.ts"
import type { DispatchResult } from "@elie-laloum/outpost";

export const branch = {
  mode: "named",
  name: "outpost/rename-user-name",
} as const;
export const delivery = (
  repository: string,
  result: DispatchResult<unknown>,
) => ({
  repository,
  branch: result.branch,
  commits: result.commits,
});
```

```ts title="rename-contract.ts"
import { defineJsonResponse } from "@elie-laloum/outpost";

export const rename = defineJsonResponse({
  tag: "rename",
  schema(input) {
    const { from, to, notes } = Object(input) as Record<string, unknown>;
    if (
      typeof from !== "string" ||
      typeof to !== "string" ||
      typeof notes !== "string"
    )
      throw new Error("Expected from, to and notes as strings");
    return { from, to, notes };
  },
});
```

```ts title="api-brief.ts"
export const apiBrief = {
  text: `Rename the user_name field of GET /users to username.\nUpdate the handlers, the OpenAPI schema and the tests, run the tests and commit.\nFinish with <rename>{"from":"<old>","to":"<new>","notes":"<what clients must change>"}</rename>.`,
};
```

```ts title="api-agent.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { sandboxProvider, coder } from "./outpost.config.ts";
import { branch } from "./delivery.ts";
import { rename } from "./rename-contract.ts";
import { apiBrief } from "./api-brief.ts";

export const apiAgent = defineIsolatedTask({
  key: "api-agent",
  request: () => ({
    repository: "/projects/api",
    sandboxProvider,
    agent: coder,
    branch,
    response: rename,
    brief: apiBrief,
  }),
});
```

```ts title="api.ts"
import { defineTask } from "@elie-laloum/outpost";
import { apiAgent } from "./api-agent.ts";
import { delivery } from "./delivery.ts";

export const api = defineTask({
  key: "api",
  perform: async (context) => {
    const result = await apiAgent.perform(context);
    return { ...delivery("/projects/api", result), change: result.value };
  },
});
```

Update the clients, wait for approval, then integrate each branch explicitly.

<!-- tabs -->

```ts title="client-request.ts"
import type { TaskContext } from "@elie-laloum/outpost";
import { api } from "./api.ts";
import { sandboxProvider, coder } from "./outpost.config.ts";
import { branch } from "./delivery.ts";

export function clientRequest(repository: string, context: TaskContext) {
  const { change } = context.value(api);
  return {
    repository,
    sandboxProvider,
    agent: coder,
    branch,
    brief: {
      text: `The API renamed ${change.from} to ${change.to}. ${change.notes}\nUpdate this client, run its tests and commit.`,
    },
  };
}
```

```ts title="client.ts"
import { defineIsolatedTask, defineTask } from "@elie-laloum/outpost";
import { clientRequest } from "./client-request.ts";
import { api } from "./api.ts";
import { delivery } from "./delivery.ts";

export function client(key: string, repository: string) {
  const agent = defineIsolatedTask({
    key: `${key}-agent`,
    request: (context) => clientRequest(repository, context),
  });
  return defineTask({
    key,
    after: [api],
    perform: async (context) =>
      delivery(repository, await agent.perform(context)),
  });
}
```

```ts title="clients.ts"
import { client } from "./client.ts";

export const clients = [
  client("web", "/projects/web"),
  client("mobile", "/projects/mobile"),
];
```

```ts title="approval.ts"
import { defineApprovalTask } from "@elie-laloum/outpost";
import { api } from "./api.ts";
import { clients } from "./clients.ts";

export const approve = defineApprovalTask({
  key: "approve",
  after: [api, ...clients],
  prompt: "Merge outpost/rename-user-name into api, web and mobile?",
  actors: ["maintainer"],
});
```

```ts title="merge.ts"
import { defineTask } from "@elie-laloum/outpost";
import { api } from "./api.ts";
import { clients } from "./clients.ts";
import { approve } from "./approval.ts";
import { execFileSync } from "node:child_process";

export const merge = defineTask({
  key: "merge",
  after: [api, ...clients, approve],
  perform: (context) =>
    [api, ...clients].map((task) => {
      const { repository, branch } = context.value(task);
      execFileSync("git", ["-C", repository, "merge", "--ff-only", branch]);
      return repository;
    }),
});
```

Keep the run in a checkpoint and use `rename-field.ts` to start or resume it.

<!-- tabs -->

```ts title="rename-workflow.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { api } from "./api.ts";
import { clients } from "./clients.ts";
import { approve } from "./approval.ts";
import { merge } from "./merge.ts";

export const workflow = defineWorkflow("rename-user-name", [
  api,
  ...clients,
  approve,
  merge,
]);
```

```ts title="rename-checkpoint.ts"
import {
  createWorkflowCheckpointStore,
  createLocalTransport,
} from "@elie-laloum/outpost";

export const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
export const command = process.argv[2];
export const checkpoint = {
  store,
  runId: "rename-user-name",
  version: "1",
  ...(command === "retry" ? { resume: "retry-incomplete" as const } : {}),
};
```

```ts title="merge-decision.ts"
import type { WorkflowDecision } from "@elie-laloum/outpost";

export function mergeDecision(
  executionId: string,
  requestId: string,
  action: "approve" | "reject",
): WorkflowDecision {
  return {
    executionId,
    key: "approve",
    requestId,
    actor: "maintainer",
    reason: "Reviewed the three branches",
    action,
  };
}
```

```ts title="rename-result.ts"
import { reportValue } from "./reporter.ts";
import type { WorkflowResult } from "@elie-laloum/outpost";

export function showRun(result: WorkflowResult) {
  reportValue(result.status);
  // Example output: done
  for (const task of result.tasks)
    reportValue(task.key, task.status, task.error ?? "");
  // Example output: api done
}
```

```ts title="rename-field.ts"
import { workflow } from "./rename-workflow.ts";
import { checkpoint, command } from "./rename-checkpoint.ts";
import { clients } from "./clients.ts";
import { mergeDecision } from "./merge-decision.ts";
import { showRun } from "./rename-result.ts";

export let result = await workflow.start({
  checkpoint,
  concurrency: clients.length,
  stopOnError: false,
});
export const pending = result.tasks.find(
  (task) => task.key === "approve",
)?.pause;
if (pending && (command === "approve" || command === "reject"))
  result = await workflow.start({
    checkpoint,
    decisions: [mergeDecision(result.executionId, pending.id, command)],
  });
showRun(result);
```

### Run the script

Run the entry script to create the branches and pause at the approval gate. It leaves the changes available for review in each repository.

```sh
node rename-field.ts
```

It prints `paused`: the three branches exist and wait for review. Inspect `outpost/rename-user-name` in each checkout, then decide.

```sh
node rename-field.ts approve
```

It prints `done`. The branches are merged into each checkout’s current branch, API first. Nothing is pushed.

## Understand the steps

<!-- canvas -->

- [Your script](../durable-runs/): `rename-field.ts` starts the run, then resumes it with `approve` or `reject`.
  - host
  - → **api**: `workflow.start()`
  - → **approve**: decision
- [api](../typed-responses/): Renames the field first and returns `{ from, to, notes }`, checked by `defineJsonResponse()`.
  - workflow
  - → **API**: brief
  - → **Clients**: the change
- [Clients](../concurrency-and-retries/): Both run at the same time, with `concurrency: 2`.
  - workflow
  - **web**: the API change in its brief
    - → **Web**: brief
  - **mobile**: the API change in its brief
    - → **Mobile**: brief
  - → **approve**: three branches
- [approve](../approvals/): `defineApprovalTask()` saves the request and ends the process with `paused`.
  - workflow
  - → **merge**: approved
- **merge**: Fast-forwards each checkout to its branch, API first.
  - workflow
  - → **Checkouts**: `git merge --ff-only`
- [Sandboxes](../multiple-repositories/): One per repository, each on `outpost/rename-user-name`.
  - sandbox
  - **API**: `/projects/api`
  - **Web**: `/projects/web`
  - **Mobile**: `/projects/mobile`
  - → **Checkouts**: commits on each branch
- **Checkouts**: Your three repositories. Nothing is pushed.
  - host

Checkpoints hold JSON only. Each wrapper task therefore calls its isolated task’s `perform()` and keeps `repository`, `branch` and `commits`, not the dispatch result.

## Handle a repository failure

Each repository has its own branch and history: nothing spans them. By default a failure cancels the running tasks; `stopOnError: false` lets the other client finish.

| What you see                                       | What to do                                                                                      |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `api` `failed`, clients `skipped`                  | Read `task.error`, fix the cause, run `node rename-field.ts retry`.                             |
| One client `failed`, the other `done`              | `retry` reruns only the failed client, on the same branch. The others come from the checkpoint. |
| `approve` `rejected`, `merge` `skipped`            | The branches stay. Rework them, then start a new run with another `runId`.                      |
| `merge` `failed` after merging the first checkouts | Update the blocked branch, then `retry`: already merged branches are no-ops.                    |

:::caution
Nothing reverts the API branch when a client fails. A failed task keeps its worktree; see [Recover work](../recovery/). `retry` authorizes replaying unfinished tasks and their side effects: see [Durable runs](../durable-runs/).
:::

## Adapt the example

### Add repositories

Add an entry to `clients`, such as `client("cli", "/projects/cli")`. The approval, the merge and `concurrency` follow the list.

### Use cloud sandboxes

Replace `sandboxProvider` with a provider from [Cloud sandboxes](../cloud-sandboxes/). Each task uploads its repository, and the agent’s commits come back to the host checkout before `merge` runs.

### Review before approval

Insert a read-only review task per client between the clients and `approve`, and list the reviews in the gate’s `after`.

<!-- tabs -->

```ts title="review-contract.ts"
import { defineTextResponse } from "@elie-laloum/outpost";

export const response = defineTextResponse({ tag: "review" });
export const brief = {
  text: "Review the last commits on this branch without editing files. Answer in <review></review>.",
};
```

```ts title="change.types.ts"
import type { Task } from "@elie-laloum/outpost";

export type ChangedRepository = Task<{ repository: string; branch: string }>;
```

```ts title="review-request.ts"
import type { ChangedRepository } from "./change.types.ts";
import type { TaskContext } from "@elie-laloum/outpost";
import { sandboxProvider, coder } from "./outpost.config.ts";
import { response, brief } from "./review-contract.ts";

export function reviewRequest(change: ChangedRepository, context: TaskContext) {
  const output = context.value(change);
  return {
    repository: output.repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: output.branch } as const,
    response,
    brief,
  };
}
```

```ts title="review-agent.ts"
import type { ChangedRepository } from "./change.types.ts";
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { reviewRequest } from "./review-request.ts";

export function reviewAgent(change: ChangedRepository) {
  return defineIsolatedTask({
    key: `${change.key}-review-agent`,
    request: (context) => reviewRequest(change, context),
  });
}
```

```ts title="review.ts"
import type { ChangedRepository } from "./change.types.ts";
import { reviewAgent } from "./review-agent.ts";
import { defineTask } from "@elie-laloum/outpost";

export function review(change: ChangedRepository) {
  const agent = reviewAgent(change);
  return defineTask({
    key: `${change.key}-review`,
    after: [change],
    perform: async (context) => (await agent.perform(context)).value,
  });
}
```

The paused run then holds each review: read it with `result.value(task)` before deciding.

API: [defineIsolatedTask](../../reference/defineisolatedtask/) · [defineJsonResponse](../../reference/definejsonresponse/) · [defineApprovalTask](../../reference/defineapprovaltask/) · [WorkflowOptions](../../reference/workflowoptions/) · [WorkflowCheckpointOptions](../../reference/workflowcheckpointoptions/).
