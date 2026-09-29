---
title: "Change several repositories"
description: "An agent renames a field in an API and describes the change; two agents update the web and mobile clients from that description at the same time; a maintainer approves before any branch merges."
---

## What you use

<!-- features -->

- [Multiple repositories](../multiple-repositories/): One task per checkout, each with its own sandbox and branch.
  - `defineIsolatedTask()`
- [Typed responses](../typed-responses/): The API agent returns a validated description of its change.
  - `defineJsonResponse()`
- [Tasks and dependencies](../task-dependencies/): The clients start after the API and read its output.
  - `after`
  - `context.value()`
- [Concurrency, retries and timeouts](../concurrency-and-retries/): Both clients run at the same time.
  - `concurrency`
  - `stopOnError`
- [Approvals](../approvals/): A maintainer decides before anything merges.
  - `defineApprovalTask()`
- [Durable runs](../durable-runs/): The checkpoint keeps finished work between runs.
  - `createWorkflowCheckpointStore()`

## The code

Place the file next to the `outpost.config.mts` from [Setup](../setup/) and replace the three paths with your checkouts.

```ts title="rename-field.mts"
import { execFileSync } from "node:child_process";
import {
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineApprovalTask,
  defineIsolatedTask,
  defineJsonResponse,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import type { DispatchResult } from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.mts";

const branch = { mode: "named", name: "outpost/rename-user-name" } as const;
const delivery = (repository: string, result: DispatchResult<unknown>) => ({
  repository,
  branch: result.branch,
  commits: result.commits,
});

const rename = defineJsonResponse({
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

const apiAgent = defineIsolatedTask({
  key: "api-agent",
  request: () => ({
    repository: "/projects/api",
    sandboxProvider,
    agent: coder,
    branch,
    response: rename,
    brief: {
      text: `Rename the user_name field of GET /users to username.
Update the handlers, the OpenAPI schema and the tests, run the tests and commit.
Finish with <rename>{"from":"<old>","to":"<new>","notes":"<what clients must change>"}</rename>.`,
    },
  }),
});
const api = defineTask({
  key: "api",
  perform: async (context) => {
    const result = await apiAgent.perform(context);
    return { ...delivery("/projects/api", result), change: result.value };
  },
});

function client(key: string, repository: string) {
  const agent = defineIsolatedTask({
    key: `${key}-agent`,
    request: (context) => {
      const { change } = context.value(api);
      return {
        repository,
        sandboxProvider,
        agent: coder,
        branch,
        brief: {
          text: `The API renamed ${change.from} to ${change.to}. ${change.notes}
Update this client, run its tests and commit.`,
        },
      };
    },
  });
  return defineTask({
    key,
    after: [api],
    perform: async (context) =>
      delivery(repository, await agent.perform(context)),
  });
}
const clients = [
  client("web", "/projects/web"),
  client("mobile", "/projects/mobile"),
];

const approve = defineApprovalTask({
  key: "approve",
  after: [api, ...clients],
  prompt: "Merge outpost/rename-user-name into api, web and mobile?",
  actors: ["maintainer"],
});
const merge = defineTask({
  key: "merge",
  after: [api, ...clients, approve],
  perform: (context) =>
    [api, ...clients].map((task) => {
      const { repository, branch } = context.value(task);
      execFileSync("git", ["-C", repository, "merge", "--ff-only", branch]);
      return repository;
    }),
});

const workflow = defineWorkflow("rename-user-name", [
  api,
  ...clients,
  approve,
  merge,
]);
const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
const command = process.argv[2];
const checkpoint = {
  store,
  runId: "rename-user-name",
  version: "1",
  ...(command === "retry" ? { resume: "retry-incomplete" as const } : {}),
};

let result = await workflow.start({
  checkpoint,
  concurrency: clients.length,
  stopOnError: false,
});
const pending = result.tasks.find((task) => task.key === "approve")?.pause;
if (pending && (command === "approve" || command === "reject"))
  result = await workflow.start({
    checkpoint,
    decisions: [
      {
        executionId: result.executionId,
        key: "approve",
        requestId: pending.id,
        actor: "maintainer",
        reason: "Reviewed the three branches",
        action: command,
      },
    ],
  });
console.log(result.status);
for (const task of result.tasks)
  console.log(task.key, task.status, task.error ?? "");
```

```sh
node rename-field.mts
```

It prints `paused`: the three branches exist and wait for review. Inspect `outpost/rename-user-name` in each checkout, then decide.

```sh
node rename-field.mts approve
```

It prints `done`. The branches are merged into each checkout’s current branch, API first. Nothing is pushed.

## How it works

<!-- flow -->

1. **API**: The contract changes first.
   - `api`: Renames the field on its branch and returns `{ from, to, notes }`.
     - `defineIsolatedTask()`
     - `defineJsonResponse()`
     - sandbox
2. **Clients**: Two agents run at the same time.
   - **`web`, `mobile`**: Each gets its own sandbox and branch, with the API change in its brief.
     - `context.value()`
     - `concurrency`
     - sandbox
3. **Approval**: The run stops until a maintainer decides.
   - `approve`: Saves the request in the checkpoint and ends the process with `paused`.
     - `defineApprovalTask()`
   - **Decision**: `approve` or `reject` restarts the run; finished tasks come from the checkpoint.
     - `decisions`
4. **Merge**: Only after approval.
   - `merge`: Fast-forwards each checkout to its branch, API first.
     - host

Checkpoints hold JSON only. Each wrapper task therefore calls its isolated task’s `perform()` and keeps `repository`, `branch` and `commits`, not the dispatch result.

## When one repository fails

Each repository has its own branch and history: nothing spans them. By default a failure cancels the running tasks; `stopOnError: false` lets the other client finish.

| What you see                                       | What to do                                                                                      |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `api` `failed`, clients `skipped`                  | Read `task.error`, fix the cause, run `node rename-field.mts retry`.                            |
| One client `failed`, the other `done`              | `retry` reruns only the failed client, on the same branch. The others come from the checkpoint. |
| `approve` `rejected`, `merge` `skipped`            | The branches stay. Rework them, then start a new run with another `runId`.                      |
| `merge` `failed` after merging the first checkouts | Update the blocked branch, then `retry`: already merged branches are no-ops.                    |

:::caution
Nothing reverts the API branch when a client fails. A failed task keeps its worktree; see [Recover work](../recovery/). `retry` authorizes replaying unfinished tasks and their side effects: see [Durable runs](../durable-runs/).
:::

## Adapt it

### Add repositories

Add an entry to `clients`, such as `client("cli", "/projects/cli")`. The approval, the merge and `concurrency` follow the list.

### Use cloud sandboxes

Replace `sandboxProvider` with a provider from [Cloud sandboxes](../cloud-sandboxes/). Each task uploads its repository, and the agent’s commits come back to the host checkout before `merge` runs.

### Review before approval

Insert a read-only review task per client between the clients and `approve`, and list the reviews in the gate’s `after`.

```ts
import {
  defineIsolatedTask,
  defineTask,
  defineTextResponse,
} from "@elie-laloum/outpost";
import type { Task } from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.mts";

export function review(change: Task<{ repository: string; branch: string }>) {
  const agent = defineIsolatedTask({
    key: `${change.key}-review-agent`,
    request: (context) => ({
      repository: context.value(change).repository,
      sandboxProvider,
      agent: coder,
      branch: { mode: "named", name: context.value(change).branch },
      response: defineTextResponse({ tag: "review" }),
      brief: {
        text: "Review the last commits on this branch without editing files. Answer in <review></review>.",
      },
    }),
  });
  return defineTask({
    key: `${change.key}-review`,
    after: [change],
    perform: async (context) => (await agent.perform(context)).value,
  });
}
```

The paused run then holds each review: read it with `result.value(task)` before deciding.

API: [defineIsolatedTask](../../reference/defineisolatedtask/) · [defineJsonResponse](../../reference/definejsonresponse/) · [defineApprovalTask](../../reference/defineapprovaltask/) · [WorkflowOptions](../../reference/workflowoptions/) · [WorkflowCheckpointOptions](../../reference/workflowcheckpointoptions/).
