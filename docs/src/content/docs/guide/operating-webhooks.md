---
title: "Operate a webhook server"
description: "Interpret responses, deduplicate deliveries and rotate secrets."
---

Start from [webhooks](../webhooks/) and its configuration. Interpret responses, deduplicate deliveries and rotate secrets.

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
- Start this TypeScript server from your script. A YAML project can instead declare a trigger service and run it with [`outpost recipe serve --service`](../recipe-services/).

API: [serveTriggers](../../reference/servetriggers/) · [createGithubWebhook](../../reference/creategithubwebhook/) · [createGitlabWebhook](../../reference/creategitlabwebhook/) · [createSlackSource](../../reference/createslacksource/) · [createStandardWebhook](../../reference/createstandardwebhook/) · [labelAdded](../../reference/labeladded/) · [commandIssued](../../reference/commandissued/) · [TriggerEvent](../../reference/triggerevent/) · [TriggerJob](../../reference/triggerjob/) · [defineWorkflowJob](../../reference/defineworkflowjob/).
