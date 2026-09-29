---
title: "Review a pull request on demand"
description: "Start an agent review when a label is added to a pull request, then post its typed verdict from your own code."
---

A maintainer adds the `outpost:review` label to a GitHub pull request. A webhook server queues the request; a worker has an agent review the head commit in its own sandbox and returns `{ approved, findings }` to the code that posts it.

## What you use

<!-- features -->

- [Webhooks](../webhooks/): Verify the delivery and turn the label event into a job.
  - `serveTriggers()`
  - `createGithubWebhook()`
  - `labelAdded()`
- [Job queues and workers](../job-queues/): Hand the job from the server to a worker process.
  - `createSqliteTaskQueue()`
  - `runQueueWorker()`
  - `defineWorkflowJob()`
- [Durable runs](../durable-runs/): Save each task’s output under the job’s `runId`.
  - `createWorkflowCheckpointStore()`
- [Tasks and dependencies](../task-dependencies/): Fetch, review, then post.
  - `defineTask()`
  - `defineIsolatedTask()`
- [Typed responses](../typed-responses/): Validate the agent’s verdict.
  - `defineJsonResponse()`
- [Repository and branch](../repository-and-branch/): Start the review branch at the pull request’s head commit.
  - `named`
  - `from`

## The code

Run both files from the same directory, next to the `outpost.config.mts` from [Setup](../setup/). Its `repository` is a local clone of the reviewed GitHub repository.

```ts title="server.mts"
import {
  createGithubWebhook,
  createSqliteTaskQueue,
  labelAdded,
  serveTriggers,
} from "@elie-laloum/outpost";
import type { WorkflowJson } from "@elie-laloum/outpost";

const secret = process.env.GITHUB_WEBHOOK_SECRET;
if (!secret) throw new Error("Set GITHUB_WEBHOOK_SECRET");
const reviewers = new Set(["github:octocat"]);

// Reads a nested value from the webhook payload.
function field(value: WorkflowJson | undefined, ...path: string[]) {
  for (const key of path) {
    if (typeof value !== "object" || value === null) return undefined;
    value = Object.entries(value).find(([name]) => name === key)?.[1];
  }
  return value;
}

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const server = await serveTriggers({
  queue,
  port: 8787,
  routes: [
    {
      path: "/github",
      source: createGithubWebhook({ secret }),
      on(event) {
        const pull = labelAdded(event, "outpost:review");
        if (pull?.target !== "pull-request") return undefined;
        if (!event.actor || !reviewers.has(event.actor)) return undefined;
        const base = field(event.payload, "pull_request", "base", "sha");
        const head = field(event.payload, "pull_request", "head", "sha");
        if (typeof base !== "string" || typeof head !== "string")
          return undefined;
        return {
          handler: "review",
          runId: `review:${pull.repository}#${pull.number}@${head}`,
          input: {
            repository: pull.repository,
            number: pull.number,
            base,
            head,
          },
        };
      },
    },
  ],
  onError: (error, failure) => console.error(failure, error),
});
console.log(`Listening on ${server.url}/github`);
process.once("SIGINT", async () => {
  await server.close();
  queue.close();
});
```

```ts title="worker.mts"
import {
  createLocalTransport,
  createSqliteTaskQueue,
  createWorkflowCheckpointStore,
  defineIsolatedTask,
  defineJsonResponse,
  defineTask,
  defineWorkflow,
  defineWorkflowJob,
  runQueueWorker,
} from "@elie-laloum/outpost";
import type { WorkflowJson } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

type PullRequest = {
  repository: string;
  number: number;
  base: string;
  head: string;
};
type Verdict = { approved: boolean; findings: string[] };

const verdict = defineJsonResponse({
  tag: "verdict",
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

function readPullRequest(input: WorkflowJson): PullRequest {
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

function reviewWorkflow(pull: PullRequest) {
  const fetch = defineTask({ key: "fetch", perform: () => fetchCommits(pull) });
  const agent = defineIsolatedTask({
    key: "review-agent",
    request: () => ({
      repository,
      sandboxProvider,
      agent: coder,
      branch: {
        mode: "named",
        name: `outpost/review-${pull.number}-${pull.head.slice(0, 12)}`,
        from: pull.head,
      },
      response: verdict,
      brief: {
        text: [
          `Review pull request #${pull.number}: git diff ${pull.base}...HEAD.`,
          "Do not edit files. Report each problem as path:line: message.",
          'End with <verdict>{"approved": true, "findings": []}</verdict>.',
        ].join("\n"),
      },
    }),
  });
  const review = defineTask({
    key: "review",
    after: [fetch],
    perform: async (context) => (await agent.perform(context)).value,
  });
  const post = defineTask({
    key: "post",
    after: [review],
    perform: (context) =>
      postVerdict(pull, context.value(review), context.idempotencyKey),
  });
  return defineWorkflow("review-pull-request", [fetch, review, post]);
}

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runQueueWorker({
    queue,
    worker: "reviewer-1",
    signal: stop.signal,
    handlers: {
      review: defineWorkflowJob({
        checkpoint: { store, version: "1" },
        workflow: (input) => reviewWorkflow(readPullRequest(input)),
      }),
    },
  });
} finally {
  queue.close();
}

// Your code: make pull.base and pull.head available in the local clone,
// for example with `git fetch origin pull/<number>/head`.
async function fetchCommits(pull: PullRequest): Promise<void> {
  throw new Error(`Fetch ${pull.base} and ${pull.head} into ${repository}`);
}

// Your code: post the verdict to GitHub, deduplicated by idempotencyKey.
async function postVerdict(
  pull: PullRequest,
  result: Verdict,
  idempotencyKey: string,
): Promise<void> {
  throw new Error(`Post ${result.approved} on #${pull.number}`);
}
```

```sh
GITHUB_WEBHOOK_SECRET=… node server.mts
node worker.mts
```

Point the repository’s webhook at the server’s `/github` path through an HTTPS proxy, with the same secret and the “Pull requests” event.

## How it works

<!-- flow -->

1. **Receive**: The server answers GitHub within its 10-second limit.
   - **Verify**: The signature must match the webhook secret, otherwise `401`.
     - `createGithubWebhook()`
   - **Filter**: Keep a new `outpost:review` label on a pull request, added by someone in `reviewers`.
     - `labelAdded()`
     - `event.actor`
   - **Publish**: Queue a `review` job whose input carries the repository, number, base and head commits.
     - `serveTriggers()`
2. **Run**: The worker claims the job in its own process.
   - **Claim**: Take the job from the shared SQLite file.
     - `runQueueWorker()`
   - **Checkpoint**: Start the workflow under the job’s `runId`.
     - `defineWorkflowJob()`
3. **Review**: The agent reads the pull request, not your checkout.
   - **fetch**: Your code brings the two commits into the local clone.
     - host
   - **review**: The agent works on a branch at the head commit, in its own sandbox, and returns a checked verdict.
     - `defineIsolatedTask()`
     - sandbox
4. **Deliver**: The verdict leaves Outpost through your code.
   - **post**: Your code publishes the verdict, keyed by `context.idempotencyKey`.
     - `defineTask()`
     - host

The `runId` names the head commit. Adding the label again on the same commit restores the finished run from its checkpoint, so nothing is reviewed or posted twice; a new commit starts a new review.

`review` returns only `.value`: checkpoints hold JSON, not the methods of a dispatch result ([From a task to a workflow](../first-workflow/)).

## Adapt it

### GitLab merge requests

Add a `/gitlab` route with `createGitlabWebhook({ signingToken })`, which verifies a signed body. `labelAdded()` also recognizes merge requests: read the head from `object_attributes.last_commit.id`, the base from `object_attributes.target_branch`, and list `gitlab:<username>` actors in `reviewers`.

### A Slack command

Add a `/slack` route with `createSlackSource({ signingSecret })` and `commandIssued(event, "/review")`, whose `text` names the pull request. Slack carries no commits: publish `{ repository, number }` and let `fetch` return `{ base, head }` for `review` to read.

### A Redis queue

Replace `createSqliteTaskQueue()` in both files with [`createBullMQTaskQueue()`](../redis-workers/) to run the server and workers on separate machines. Several worker machines also need a shared checkpoint store ([S3 and R2](../object-storage/)).

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
