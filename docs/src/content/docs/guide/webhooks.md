---
title: "Start work from webhooks"
description: "Verify incoming events and publish queue jobs for the matching workflow."
---

## Receive a webhook and publish a job

Use a webhook source to verify the incoming request, then route the accepted event to a queue job. `serveTriggers()` handles the HTTP request; workers execute the workflow after publication.

<!-- tabs -->

```ts title="label-job.ts"
import type { TriggerRoute } from "@elie-laloum/outpost";
import { labelAdded } from "@elie-laloum/outpost";

export const on: TriggerRoute["on"] = (event) => {
  const issue = labelAdded(event, "outpost:fix");
  if (!issue) return undefined;
  return {
    handler: "fix",
    runId: `${issue.repository}#${issue.number}`,
    input: { repository: issue.repository, issue: issue.number },
  };
};
```

```ts title="github-route.ts"
import { createGithubWebhook } from "@elie-laloum/outpost";
import { on } from "./label-job.ts";

export const secret = process.env.GITHUB_WEBHOOK_SECRET;
if (!secret) throw new Error("Set GITHUB_WEBHOOK_SECRET");
export const routes = [
  { path: "/github", source: createGithubWebhook({ secret }), on },
];
```

```ts title="server.ts"
import { createSqliteTaskQueue, serveTriggers } from "@elie-laloum/outpost";
import { routes } from "./github-route.ts";

export const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
export const server = await serveTriggers({
  queue,
  port: 8787,
  routes,
  onError: (error, failure) => console.error(failure, error),
});
console.log(`Listening on ${server.url}`);
```

Adding the `outpost:fix` label to an issue or a pull request publishes a `fix` job to the queue. A worker runs it with `defineWorkflowJob()`: see [Job queues and workers](../job-queues/).

<!-- canvas -->

- **Server**: Answers the sender within seconds.
  - Steps
  - **Verify**: The source checks the signature, otherwise the answer is `401`.
    - `createGithubWebhook()`
  - **Route**: `on(event)` returns a job, or `undefined` to ignore the event.
    - `labelAdded()`
    - `commandIssued()`
  - **Publish**: The job enters the queue as `trigger:<path>:<delivery>`.
    - `serveTriggers()`
  - → **Worker**: then
- **Worker**: Runs the job in its own process.
  - Steps
  - **Run**: A checkpointed workflow under the job’s `runId`.
    - `defineWorkflowJob()`

A job names a registered worker `handler`, a `runId` of at most 256 characters and an optional JSON `input`. Keep `on()` fast: GitHub waits 10 seconds for an answer, Slack 3 seconds.

## Pick a source

| Source                                  | Verification                                                                             | Delivery identifier                           | `event.actor`       |
| --------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------- |
| `createGithubWebhook({ secret })`       | `X-Hub-Signature-256`, an HMAC of the body. JSON or form payloads.                       | `X-GitHub-Delivery`                           | `github:<login>`    |
| `createGitlabWebhook({ signingToken })` | `webhook-signature` with a `whsec_` signing token (GitLab 19.0+), 5-minute window.       | `webhook-id`                                  | `gitlab:<username>` |
| `createGitlabWebhook({ token })`        | `X-Gitlab-Token` equals the token. The body is not signed.                               | `Idempotency-Key`, else `X-Gitlab-Event-UUID` | `gitlab:<username>` |
| `createSlackSource({ signingSecret })`  | `X-Slack-Signature` over the timestamp and body, 5-minute window.                        | `trigger_id`                                  | `slack:<user id>`   |
| `createStandardWebhook({ secret })`     | [Standard Webhooks](https://www.standardwebhooks.com/) `whsec_` secret, 5-minute window. | `webhook-id`                                  | none                |

Prefer a GitLab signing token: a plain token travels as is in a header and does not sign the body. `toleranceMs` changes the 5-minute window. Slack sources accept slash commands and interactive payloads.

## Read the event

Two helpers recognize the common events and return `undefined` for everything else.

API reference: [labelAdded](../../reference/labeladded/), [commandIssued](../../reference/commandissued/) and [TriggerEvent](../../reference/triggerevent/).

Use the event contract when handling another kind of delivery.

API reference: [TriggerEvent](../../reference/triggerevent/).

## Authorize senders

A verified signature proves the request comes from your GitHub, GitLab or Slack integration, not that its author may start a workflow. Anyone who can comment on a public repository can write `/outpost`: check `event.actor` against an explicit list.

```ts
import { commandIssued } from "@elie-laloum/outpost";
import type { TriggerEvent, TriggerJob } from "@elie-laloum/outpost";

const maintainers = new Set(["github:octocat", "slack:U012AB3CD"]);

function fromCommand(event: TriggerEvent): TriggerJob | undefined {
  const command = commandIssued(event, "/outpost");
  if (!command) return undefined;
  if (!event.actor || !maintainers.has(event.actor)) return undefined;
  return {
    handler: "fix",
    runId: `${command.repository ?? "slack"}#${command.number ?? event.delivery}`,
    input: { request: command.text },
  };
}
```

Pass `fromCommand` as a route’s `on`. `event.actor` is not an Outpost gate actor: [approvals](../approvals/) authenticate their deciders separately.

## Read the HTTP response

| Status | Meaning                                                                               |
| ------ | ------------------------------------------------------------------------------------- |
| `202`  | Job published, or already published for this delivery. The body is `{"job": "<id>"}`. |
| `204`  | Verified event ignored: `on()` returned `undefined`.                                  |
| `400`  | The request body could not be read.                                                   |
| `401`  | Verification failed: signature, secret, timestamp window or a missing header.         |
| `404`  | No route for this path.                                                               |
| `405`  | A method other than `POST`.                                                           |
| `413`  | Body over `maxBytes`: 1 MiB by default, 25 MiB at most.                               |
| `500`  | `on()` threw or returned an invalid job.                                              |
| `503`  | The queue rejected the job. The sender can retry the same delivery.                   |

Slack routes answer `200` with an empty body instead of `202` and `204`. `onError` receives the failure’s `path`, `stage` (`verify`, `route` or `enqueue`) and `delivery`, never a secret.

## Deduplicate redeliveries

The job identifier contains the delivery identifier. A sender retry or a manual redelivery reuses it, so the queue keeps a single job for as long as it retains that job.

A new delivery publishes a new job, even for the same event, such as a label added again. The `runId` decides whether it does work twice. Handlers that post results still need their own [idempotency keys](../job-queues/).

## Derive the run from the payload

Build `runId` from what identifies the work in the payload: `owner/name#12`, or a head commit. Jobs with the same `runId` and the same `input` share one [checkpoint](../durable-runs/): `defineWorkflowJob()` restores the tasks already done instead of running them again.

A different `input` under the same `runId` fails with an incompatible checkpoint, because the checkpoint version includes a digest of the input. Two commands with different text on one issue therefore need distinct run IDs, for example with `event.delivery` added.

GitHub signatures carry no timestamp, so a captured request can be replayed under a new delivery identifier. A payload-derived `runId` makes that replay converge on the same run. The [Review a pull request on demand](../review-on-label/) recipe keys each run on the head commit.

## Rotate a secret

Every secret option also accepts a callback that returns the secrets accepted right now. The source calls it on each request.

```ts
import { createGithubWebhook } from "@elie-laloum/outpost";

const source = createGithubWebhook({
  secret: () =>
    [
      process.env.GITHUB_WEBHOOK_SECRET,
      process.env.GITHUB_WEBHOOK_SECRET_PREVIOUS,
    ].filter((value) => value !== undefined),
});
```

Accept both secrets, change the secret at the sender, then drop the old one. A callback that throws or returns no secret rejects every request with `401`.

## Operate the server

`serveTriggers()` listens on `127.0.0.1` by default; `host` and `port` change it. Put a reverse proxy that terminates TLS in front of it, and expose only the route paths.

```ts
import type { DurableTaskQueue, TriggerServer } from "@elie-laloum/outpost";

declare const server: TriggerServer;
declare const queue: DurableTaskQueue;

process.once("SIGTERM", async () => {
  await server.close();
  queue.close();
});
```

Close the server first, so no request reaches a closed queue.

## Limits

- Outpost does not call the GitHub, GitLab or Slack APIs: your workflow posts comments or messages about the result.
- The Slack Events API and its URL verification challenge are not supported.
- No `outpost` CLI command runs the server: start it from your own script.

API: [serveTriggers](../../reference/servetriggers/) · [createGithubWebhook](../../reference/creategithubwebhook/) · [createGitlabWebhook](../../reference/creategitlabwebhook/) · [createSlackSource](../../reference/createslacksource/) · [createStandardWebhook](../../reference/createstandardwebhook/) · [labelAdded](../../reference/labeladded/) · [commandIssued](../../reference/commandissued/) · [TriggerEvent](../../reference/triggerevent/) · [TriggerJob](../../reference/triggerjob/) · [defineWorkflowJob](../../reference/defineworkflowjob/).
