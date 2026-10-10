---
title: "Start work from webhooks"
description: "Verify incoming events and publish queue jobs for the matching workflow."
---

Prepare a [queue and worker](../job-queues/) before exposing a webhook. The HTTP server verifies and queues a request; it does not run the agent. You also need an application rule deciding which verified senders may request work.

## Receive a webhook and publish a job

Use a webhook source to verify the incoming request, then route the accepted event to a queue job. `serveTriggers()` handles the HTTP request; workers execute the workflow after publication.

<!-- tabs -->

```ts title="label-job.ts"
import type { TriggerRoute } from "@elie-laloum/outpost";
import { labelAdded } from "@elie-laloum/outpost";

const allowedActors = new Set(["github:octocat"]);
export const on: TriggerRoute["on"] = (event) => {
  if (!event.actor || !allowedActors.has(event.actor)) return undefined;
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
// Example output: Listening on http://127.0.0.1:8787
```

Adding the `outpost:fix` label to an issue or a pull request publishes a `fix` job to the queue. A worker runs it with `defineWorkflowJob()`: see [Job queues and workers](../job-queues/).

<!-- canvas -->

- **Verify**: Check the incoming signature before routing the event.
  - HTTP server
  - → **Queue**: accepted event
  - → **Reject**: bad signature
- **Queue**: Store a job and answer the HTTP request.
  - Queue
  - → **Worker**: job claimed
- **Reject**: Return 401 without publishing a job.
  - HTTP server
- **Worker**: Run the workflow in a separate process.
  - Worker

A job names a registered worker `handler`, a `runId` of at most 256 characters and an optional JSON `input`. Keep `on()` fast: GitHub waits 10 seconds for an answer, Slack 3 seconds.

## Check a local delivery

Set `GITHUB_WEBHOOK_SECRET` for both processes and run `node server.ts`. In another terminal, run `node send-webhook.ts`: expect `202`, then `401`. No worker is needed for this check; the job stays in the queue. Replace `github:octocat` with authorized actors before connecting a real repository.

```ts title="send-webhook.ts"
import { createHmac, randomUUID } from "node:crypto";

const secret = process.env.GITHUB_WEBHOOK_SECRET;
if (!secret) throw new Error("Set GITHUB_WEBHOOK_SECRET");
const body = JSON.stringify({
  action: "labeled",
  label: { name: "outpost:fix" },
  issue: { number: 42 },
  repository: { full_name: "acme/app" },
  sender: { login: "octocat" },
});
const signature = createHmac("sha256", secret).update(body).digest("hex");
for (const digest of [signature, "0".repeat(64)]) {
  const response = await fetch(
    `${process.env.WEBHOOK_URL ?? "http://127.0.0.1:8787"}/github`,
    {
      method: "POST",
      body,
      headers: {
        "content-type": "application/json",
        "x-github-event": "issues",
        "x-github-delivery": randomUUID(),
        "x-hub-signature-256": `sha256=${digest}`,
      },
    },
  );
  console.log(response.status);
}
```

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

<span id="read-the-http-response"></span>
<span id="deduplicate-redeliveries"></span>
<span id="derive-the-run-from-the-payload"></span>
<span id="rotate-a-secret"></span>
<span id="operate-the-server"></span>
<span id="limits"></span>

For this step, follow [Operate a webhook server](../operating-webhooks/).
