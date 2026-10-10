---
title: "Save a review when a label is added"
description: "Use a verified webhook to queue an agent review when a label is added."
---

Save the script next to the configuration from [Installation](../setup/) and run it with Node.js. It receives verified label events and publishes review jobs; the worker runs the agent separately.

This example produces a JSON report in `<repository>/.outpost/reviews/`, not a GitHub comment. Prepare a local clone containing the pull request’s base and head commits. Set `REVIEW_REPOSITORY` to its `owner/repository` name, update the allowed actor in `webhook-source.ts`, then configure the webhook and start both processes. The worker prints the report path. Add GitHub publication later with its own persistent deduplication.

[Download all files](../../guide-examples/review-on-label.tar.gz). Extract into a dedicated directory, run `npm install`, then adapt `outpost.config.ts` using [Installation](../setup/). The commands below identify the scripts to run.

<!-- canvas -->

- **Receive label**: Verify the signature, review label and permitted actor.
  - HTTP server
  - → **Queue review**: request accepted
- **Queue review**: The HTTP server stores a job in the shared queue.
  - Queue
  - → **Review diff**: job claimed
- **Review diff**: The agent examines the pull request in its own sandbox.
  - Worker
  - → **Save verdict**: valid verdict
- **Save verdict**: Write the local JSON report with an idempotency key.
  - Worker

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
console.log(`Listening on ${server.url}/github`);
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
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile, link, rm } from "node:fs/promises";
import { join } from "node:path";
import type { PullRequest, Verdict } from "./review.types.ts";
import { repository } from "./outpost.config.ts";

const exec = promisify(execFile);
export async function requireCommits(pull: PullRequest): Promise<void> {
  if (pull.repository !== process.env.REVIEW_REPOSITORY)
    throw new Error("Pull request does not match REVIEW_REPOSITORY");
  for (const oid of [pull.base, pull.head]) {
    if (!/^[a-f0-9]{40,64}$/.test(oid)) throw new Error("Invalid commit ID");
    await exec("git", ["-C", repository, "cat-file", "-e", `${oid}^{commit}`]);
  }
}
export async function saveVerdict(
  pull: PullRequest,
  result: Verdict,
  idempotencyKey: string,
): Promise<void> {
  const directory = join(repository, ".outpost", "reviews");
  await mkdir(directory, { recursive: true });
  const key = createHash("sha256").update(idempotencyKey).digest("hex");
  const destination = join(directory, `${key}.json`);
  const temporary = join(directory, `${key}.${randomUUID()}.tmp`);
  const body = JSON.stringify({ pull, result }, null, 2) + "\n";
  await writeFile(temporary, body, { flag: "wx", mode: 0o600 });
  try {
    try {
      await link(temporary, destination);
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !("code" in error) ||
        error.code !== "EEXIST"
      )
        throw error;
      if ((await readFile(destination, "utf8")) !== body)
        throw new Error("Verdict receipt differs");
    }
  } finally {
    await rm(temporary, { force: true });
  }
  console.log(destination);
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

Run the reviewer on the requested commit and save its verdict through a dependent task.

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
import { saveVerdict } from "./github-effects.ts";

export function postTask(
  pull: PullRequest,
  review: ReturnType<typeof reviewTask>,
) {
  return defineTask({
    key: "post",
    after: [review],
    perform: (context) =>
      saveVerdict(pull, context.value(review), context.idempotencyKey),
  });
}
```

```ts title="review-workflow.ts"
import type { PullRequest } from "./review.types.ts";
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";
import { requireCommits } from "./github-effects.ts";
import { reviewTask } from "./pull-review.ts";
import { postTask } from "./post-review.ts";

export function reviewWorkflow(pull: PullRequest) {
  const fetch = defineTask({
    key: "fetch",
    perform: () => requireCommits(pull),
  });
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
REVIEW_REPOSITORY=owner/repository node worker.ts
```

Point the repository’s webhook at the server’s `/github` path through an HTTPS proxy, with the same secret and the “Pull requests” event.

## Understand the steps

The `runId` names the head commit. Adding the label again on the same commit restores the finished run from its checkpoint, so the completed tasks are reused; a new commit starts a new review. The local receipt also detects a conflicting repeated write.

`review` returns only `.value`: checkpoints hold JSON, not the methods of a dispatch result ([From a task to a workflow](../first-workflow/)).

## Adapt the example

### GitLab merge requests

For GitLab, use `createGitlabWebhook({ signingToken })` and authorize `gitlab:<username>` actors. Adapt the input resolver: the event names a target branch, while this example requires a verified base commit ID available in the local clone. Passing the branch name to `requireCommits` is rejected.

### A Slack command

Add a `/slack` route with `createSlackSource({ signingSecret })` and `commandIssued(event, "/review")`, whose `text` names the pull request. Slack carries no commits: add a trusted resolver for `{ repository, number }`, obtain and prepare the base and head commits, then build the review input. The existing `requireCommits` only checks local commits.

### A Redis queue

Replace `createSqliteTaskQueue()` in the queue configuration with [`createBullMQTaskQueue()`](../redis-workers/) to run the server and workers on separate machines. Several worker machines also need a shared checkpoint store ([S3 and R2](../object-storage/)).

### Approve before saving or publishing

Insert an [approval gate](../approvals/) between `review` and `post`. The job then completes as `paused`, with the pending gate in its value; submit the decision to the same run as shown in [Job queues and workers](../job-queues/).

```ts
import { defineApprovalTask, defineTask } from "@elie-laloum/outpost";
import type { Task } from "@elie-laloum/outpost";

type Verdict = { approved: boolean; findings: string[] };
declare const review: Task<Verdict>;
declare function saveVerdict(verdict: Verdict, key: string): Promise<void>;

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
    saveVerdict(context.value(review), context.idempotencyKey),
});
```

## Limits

- The worker reviews the clone named by `repository`; map `pull.repository` to a clone to serve several repositories.
- “Do not edit files” is an instruction to the agent. Its review branch is never merged or pushed; delete `outpost/review-*` branches when you no longer need them.
- A crashed worker can run `post` again: the provided `saveVerdict` deduplicates on its key ([Job queues and workers](../job-queues/)).

API: [serveTriggers](../../reference/servetriggers/) · [createGithubWebhook](../../reference/creategithubwebhook/) · [labelAdded](../../reference/labeladded/) · [createSqliteTaskQueue](../../reference/createsqlitetaskqueue/) · [runQueueWorker](../../reference/runqueueworker/) · [defineWorkflowJob](../../reference/defineworkflowjob/) · [defineIsolatedTask](../../reference/defineisolatedtask/) · [defineJsonResponse](../../reference/definejsonresponse/).
