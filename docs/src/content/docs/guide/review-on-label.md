---
title: "Review a pull request on demand"
description: "Use a verified webhook to queue an agent review when a label is added."
---

Save the script next to the configuration from [Installation](../setup/) and run it with Node.js. It receives verified label events and publishes review jobs; the worker runs the agent separately.

## What this example covers

<!-- features -->

- [Webhooks](../webhooks/): Verify the delivery and turn the label event into a job.
- [Job queues and workers](../job-queues/): Hand the job from the server to a worker process.
- [Durable runs](../durable-runs/): Save each task’s output under the job’s `runId`.
- [Tasks and dependencies](../task-dependencies/): Fetch, review, then post.
- [Typed responses](../typed-responses/): Validate the agent’s verdict.
- [Repository and branch](../repository-and-branch/): Start the review branch at the pull request’s head commit.

## Write the script

Save the files shown in the tabs in the same directory, next to the `outpost.config.ts` from [Installation](../setup/). Start the HTTP server with `server.ts` and the worker with `worker.ts`. The configuration’s `repository` is a local clone of the reviewed GitHub repository.

<!-- tabs -->

```ts title="webhook-source.ts"
import { createGithubWebhook } from "@elie-laloum/outpost";

export const secret = process.env.GITHUB_WEBHOOK_SECRET;
if (!secret) throw new Error("Set GITHUB_WEBHOOK_SECRET");
export const reviewers = new Set(["github:octocat"]);
export const source = createGithubWebhook({ secret });
```

```ts title="payload-field.ts"
import type { WorkflowJson } from "@elie-laloum/outpost";

export function field(value: WorkflowJson | undefined, ...path: string[]) {
  for (const key of path) {
    if (typeof value !== "object" || value === null) return undefined;
    value = Object.entries(value).find(([name]) => name === key)?.[1];
  }
  return value;
}
```

```ts title="pull-commits.ts"
import type { WorkflowJson } from "@elie-laloum/outpost";
import { field } from "./payload-field.ts";

export function commits(payload: WorkflowJson) {
  const base = field(payload, "pull_request", "base", "sha");
  const head = field(payload, "pull_request", "head", "sha");
  if (typeof base !== "string" || typeof head !== "string") return undefined;
  return { base, head };
}
```

```ts title="review-trigger.ts"
import type { TriggerRoute } from "@elie-laloum/outpost";
import { labelAdded } from "@elie-laloum/outpost";
import { reviewers } from "./webhook-source.ts";
import { commits } from "./pull-commits.ts";

export const on: TriggerRoute["on"] = (event) => {
  const pull = labelAdded(event, "outpost:review");
  if (pull?.target !== "pull-request") return undefined;
  if (!event.actor || !reviewers.has(event.actor)) return undefined;
  const change = commits(event.payload);
  if (!change) return undefined;
  return {
    handler: "review",
    runId: `review:${pull.repository}#${pull.number}@${change.head}`,
    input: { repository: pull.repository, number: pull.number, ...change },
  };
};
```

```ts title="server.ts"
import { reportValue } from "./reporter.ts";
import { createSqliteTaskQueue, serveTriggers } from "@elie-laloum/outpost";
import { source } from "./webhook-source.ts";
import { on } from "./review-trigger.ts";

export const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
export const server = await serveTriggers({
  queue,
  port: 8787,
  routes: [{ path: "/github", source, on }],
  onError: (error, failure) => console.error(failure, error),
});
reportValue(`Listening on ${server.url}/github`);
// Example output: Listening on http://127.0.0.1:8787/github
process.once("SIGINT", async () => {
  await server.close();
  queue.close();
});
```

Validate the queue input and verdict, and provide the GitHub operations for your application.

The explicit schema in `verdict-schema.ts` describes the input JSON injected into the prompt; `verdict.ts` validates the returned answer.

```ts title="verdict-schema.ts"
export const verdictSchema = {
  type: "object",
  properties: {
    approved: { type: "boolean" },
    findings: { type: "array", items: { type: "string" } },
  },
  required: ["approved", "findings"],
};
```

Import this schema in `verdict.ts` so automatic instructions describe the expected answer; the existing validation function continues to check its content.

<!-- tabs -->

```ts title="review.types.ts"
export type PullRequest = {
  repository: string;
  number: number;
  base: string;
  head: string;
};
export type Verdict = { approved: boolean; findings: string[] };
```

```ts title="verdict.ts"
import { defineJsonResponse } from "@elie-laloum/outpost";
import { verdictSchema } from "./verdict-schema.ts";
import type { Verdict } from "./review.types.ts";

export const verdict = defineJsonResponse({
  tag: "verdict",
  jsonSchema: verdictSchema,
  repairs: 1,
  schema(value): Verdict {
    if (typeof value !== "object" || value === null)
      throw new Error("Expected an object");
    if (!("approved" in value) || typeof value.approved !== "boolean")
      throw new Error("Expected approved: boolean");
    if (!("findings" in value) || !Array.isArray(value.findings))
      throw new Error("Expected findings: string[]");
    if (!value.findings.every((item) => typeof item === "string"))
      throw new Error("Expected findings: string[]");
    return { approved: value.approved, findings: value.findings };
  },
});
```

```ts title="read-pull.ts"
import type { WorkflowJson } from "@elie-laloum/outpost";
import type { PullRequest } from "./review.types.ts";

export function readPullRequest(input: WorkflowJson): PullRequest {
  if (typeof input !== "object" || input === null || Array.isArray(input))
    throw new Error("Expected a pull request");
  const { repository, number, base, head } = input as {
    readonly [key: string]: WorkflowJson;
  };
  if (
    typeof repository !== "string" ||
    typeof number !== "number" ||
    typeof base !== "string" ||
    typeof head !== "string"
  )
    throw new Error("Expected { repository, number, base, head }");
  return { repository, number, base, head };
}
```

```ts title="github-effects.ts"
import type { PullRequest, Verdict } from "./review.types.ts";
import { repository } from "./outpost.config.ts";

export async function fetchCommits(pull: PullRequest): Promise<void> {
  throw new Error(`Fetch ${pull.base} and ${pull.head} into ${repository}`);
}
export async function postVerdict(
  pull: PullRequest,
  result: Verdict,
  idempotencyKey: string,
): Promise<void> {
  throw new Error(`Post ${result.approved} on #${pull.number}`);
}
```

```ts title="pull-brief.ts"
import type { PullRequest } from "./review.types.ts";

export function pullBrief(pull: PullRequest) {
  return {
    text: [
      `Review pull request #${pull.number}: git diff ${pull.base}...HEAD.`,
      "Do not edit files. Report each problem as path:line: message.",
      'End with <verdict>{"approved": true, "findings": []}</verdict>.',
    ].join("\n"),
  };
}
```

Run the reviewer on the requested commit and publish its verdict through dependent tasks.

<!-- tabs -->

```ts title="pull-request.ts"
import type { PullRequest } from "./review.types.ts";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";
import { verdict } from "./verdict.ts";
import { pullBrief } from "./pull-brief.ts";

export function reviewRequest(pull: PullRequest) {
  return {
    repository,
    sandboxProvider,
    agent: coder,
    branch: {
      mode: "named",
      name: `outpost/review-${pull.number}-${pull.head.slice(0, 12)}`,
      from: pull.head,
    } as const,
    response: verdict,
    brief: pullBrief(pull),
  };
}
```

```ts title="pull-agent.ts"
import type { PullRequest } from "./review.types.ts";
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { reviewRequest } from "./pull-request.ts";

export function reviewAgent(pull: PullRequest) {
  return defineIsolatedTask({
    key: "review-agent",
    request: () => reviewRequest(pull),
  });
}
```

```ts title="pull-review.ts"
import type { PullRequest } from "./review.types.ts";
import type { Task } from "@elie-laloum/outpost";
import { reviewAgent } from "./pull-agent.ts";
import { defineTask } from "@elie-laloum/outpost";

export function reviewTask(pull: PullRequest, fetch: Task<void>) {
  const agent = reviewAgent(pull);
  return defineTask({
    key: "review",
    after: [fetch],
    perform: async (context) => (await agent.perform(context)).value,
  });
}
```

```ts title="post-review.ts"
import type { PullRequest } from "./review.types.ts";
import { reviewTask } from "./pull-review.ts";
import { defineTask } from "@elie-laloum/outpost";
import { postVerdict } from "./github-effects.ts";

export function postTask(
  pull: PullRequest,
  review: ReturnType<typeof reviewTask>,
) {
  return defineTask({
    key: "post",
    after: [review],
    perform: (context) =>
      postVerdict(pull, context.value(review), context.idempotencyKey),
  });
}
```

```ts title="review-workflow.ts"
import type { PullRequest } from "./review.types.ts";
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";
import { fetchCommits } from "./github-effects.ts";
import { reviewTask } from "./pull-review.ts";
import { postTask } from "./post-review.ts";

export function reviewWorkflow(pull: PullRequest) {
  const fetch = defineTask({ key: "fetch", perform: () => fetchCommits(pull) });
  const review = reviewTask(pull, fetch);
  const post = postTask(pull, review);
  return defineWorkflow("review-pull-request", [fetch, review, post]);
}
```

Save the workflow state and run the queue worker.

<!-- tabs -->

```ts title="review-job.ts"
import {
  createWorkflowCheckpointStore,
  createLocalTransport,
  defineWorkflowJob,
} from "@elie-laloum/outpost";
import { reviewWorkflow } from "./review-workflow.ts";
import { readPullRequest } from "./read-pull.ts";

export const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
export const job = defineWorkflowJob({
  checkpoint: { store, version: "1" },
  workflow: (input) => reviewWorkflow(readPullRequest(input)),
});
```

```ts title="worker.ts"
import { createSqliteTaskQueue, runQueueWorker } from "@elie-laloum/outpost";
import { job } from "./review-job.ts";

export const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
export const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runQueueWorker({
    queue,
    worker: "reviewer-1",
    signal: stop.signal,
    handlers: { review: job },
  });
} finally {
  queue.close();
}
```

### Run the script

Start the HTTP server and the queue worker in separate terminals. Give the server the webhook secret configured in GitHub; the worker consumes the review jobs it publishes.

```sh
GITHUB_WEBHOOK_SECRET=… node server.ts
node worker.ts
```

Point the repository’s webhook at the server’s `/github` path through an HTTPS proxy, with the same secret and the “Pull requests” event.

## Understand the steps

<!-- canvas -->

- **GitHub**: Sends a signed delivery when a label is added to a pull request, and waits 10 seconds for the answer.
  - GitHub
  - → **Server**: webhook
- [Server](../webhooks/): `serveTriggers()` checks the signature (`401` otherwise), the `outpost:review` label and the actor in `reviewers`.
  - host
  - → **Queue**: `review` job
- [Queue](../job-queues/): `.outpost/jobs.sqlite`, shared by the server and the worker.
  - host
  - → **Worker**: claim
- [Worker](../job-queues/): `runQueueWorker()` claims the job; `defineWorkflowJob()` runs the workflow under its `runId`.
  - host
  - → **fetch**: start
  - → **Checkpoint**: task outputs
- [Workflow](../task-dependencies/): Three tasks, one after the other.
  - workflow
  - **fetch**: your code brings the base and head commits into the clone
  - **review**: `defineIsolatedTask()` on a branch at the head commit
    - → **Sandbox**: brief
  - **post**: your code publishes the verdict, keyed by `context.idempotencyKey`
    - → **GitHub**: verdict
- [Sandbox](../choose-a-sandbox/): The agent reads the pull request’s diff, not your checkout.
  - sandbox
  - → **review**: checked `{ approved, findings }`
- [Checkpoint](../durable-runs/): The same label on the same commit restores the finished run.
  - host

The `runId` names the head commit. Adding the label again on the same commit restores the finished run from its checkpoint, so nothing is reviewed or posted twice; a new commit starts a new review.

`review` returns only `.value`: checkpoints hold JSON, not the methods of a dispatch result ([From a task to a workflow](../first-workflow/)).

## Adapt the example

### GitLab merge requests

Add a `/gitlab` route with `createGitlabWebhook({ signingToken })`, which verifies a signed body. `labelAdded()` also recognizes merge requests: read the head from `object_attributes.last_commit.id`, the base from `object_attributes.target_branch`, and list `gitlab:<username>` actors in `reviewers`.

### A Slack command

Add a `/slack` route with `createSlackSource({ signingSecret })` and `commandIssued(event, "/review")`, whose `text` names the pull request. Slack carries no commits: publish `{ repository, number }` and let `fetch` return `{ base, head }` for `review` to read.

### A Redis queue

Replace `createSqliteTaskQueue()` in the queue configuration with [`createBullMQTaskQueue()`](../redis-workers/) to run the server and workers on separate machines. Several worker machines also need a shared checkpoint store ([S3 and R2](../object-storage/)).

### Approve before posting

Insert an [approval gate](../approvals/) between `review` and `post`. The job then completes as `paused`, with the pending gate in its value; submit the decision to the same run as shown in [Job queues and workers](../job-queues/).

```ts
import { defineApprovalTask, defineTask } from "@elie-laloum/outpost";
import type { Task } from "@elie-laloum/outpost";

type Verdict = { approved: boolean; findings: string[] };
declare const review: Task<Verdict>;
declare function postVerdict(verdict: Verdict, key: string): Promise<void>;

const approve = defineApprovalTask({
  key: "approve",
  after: [review],
  prompt: "Post the agent's review?",
  actors: ["maintainer"],
});
const post = defineTask({
  key: "post",
  after: [review, approve],
  perform: (context) =>
    postVerdict(context.value(review), context.idempotencyKey),
});
```

## Limits

- The worker reviews the clone named by `repository`; map `pull.repository` to a clone to serve several repositories.
- “Do not edit files” is an instruction to the agent. Its review branch is never merged or pushed; delete `outpost/review-*` branches when you no longer need them.
- A crashed worker can run `post` again: make `postVerdict` deduplicate on its key ([Job queues and workers](../job-queues/)).

API: [serveTriggers](../../reference/servetriggers/) · [createGithubWebhook](../../reference/creategithubwebhook/) · [labelAdded](../../reference/labeladded/) · [createSqliteTaskQueue](../../reference/createsqlitetaskqueue/) · [runQueueWorker](../../reference/runqueueworker/) · [defineWorkflowJob](../../reference/defineworkflowjob/) · [defineIsolatedTask](../../reference/defineisolatedtask/) · [defineJsonResponse](../../reference/definejsonresponse/).
