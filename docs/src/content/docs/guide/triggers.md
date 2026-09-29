---
title: "Triggers"
description: "Start workflows on a cron schedule or from verified GitHub, GitLab, Slack and Standard Webhooks events."
---

Implemented, not yet released. A trigger never runs a workflow inside the request or timer that fires it. It publishes a job to a [queue](../background-jobs/), and a worker runs the workflow with a checkpoint. Every job carries a `runId` and a JSON `input`; `defineWorkflowJob()` turns them into a checkpointed run.

```ts
import {
  createLocalTransport,
  runQueueWorker,
  createSqliteTaskQueue,
  defineTask,
  defineWorkflow,
  createWorkflowCheckpointStore,
  defineWorkflowJob,
} from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runQueueWorker({
    queue,
    worker: "worker-1",
    signal: stop.signal,
    handlers: {
      fix: defineWorkflowJob({
        checkpoint: { store, version: "1" },
        workflow: (input, { runId }) =>
          defineWorkflow(runId, [
            defineTask({ key: "report", perform: () => ({ received: input }) }),
          ]),
      }),
    },
  });
} finally {
  queue.close();
}
```

Replace the task with your own graph, for example a `defineAgentTask` that fixes the issue named in `input`. The producers below publish to the same queue: a scheduler, a webhook server, or both.

## Schedule runs

`createCronSchedule()` parses a five-field cron expression evaluated in an IANA time zone (UTC by default). `runSchedules()` publishes one job per slot until its signal aborts.

```ts
import {
  createCronSchedule,
  runSchedules,
  createSqliteTaskQueue,
} from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runSchedules({
    queue,
    signal: stop.signal,
    schedules: [
      {
        name: "nightly-audit",
        cron: createCronSchedule("0 2 * * 1-5", { timeZone: "Europe/Paris" }),
        handler: "audit",
        runId: (slot) => `audit-${slot.toISOString().slice(0, 10)}`,
        input: (slot) => ({ day: slot.toISOString().slice(0, 10) }),
      },
    ],
  });
} finally {
  queue.close();
}
```

- **Syntax.** Minute, hour, day of month, month and day of week, with lists (`1,15`), ranges (`1-5`), steps (`*/10`, `8-18/2`), month and weekday names (`JAN`, `MON-FRI`), `7` for Sunday and the macros `@hourly`, `@daily`, `@weekly`, `@monthly` and `@yearly`. As in Vixie cron, when both day fields are restricted a day matching either one fires. There is no seconds field.
- **Daylight saving time.** Slots are wall-clock times. A time skipped by a spring-forward change does not fire; a time repeated in autumn fires once, at its first occurrence.
- **Job identity.** Each slot publishes the job `schedule:<name>:<slot ISO time>`. Two schedulers sharing a queue, or a restarted one, publish the same job and the queue keeps a single copy. `runId` defaults to `<name>:<slot ISO time>` and `input` to `null`.
- **Late slots.** A slot is published only if at most `maxLateMs` (60 seconds by default) has passed. After a restart or a suspended process, only the latest missed slot within that window is published; older slots are skipped rather than replayed in a burst.
- **Failures.** Without `onError`, the first publication failure rejects `runSchedules()`. With it, the failure is reported with the schedule and slot, and scheduling continues.

`createCronSchedule()` rejects an expression that has no occurrence, such as `0 0 30 2 *`. Its `next()` and `previous()` methods compute slots without publishing anything:

```ts
import { createCronSchedule } from "@elie-laloum/outpost";

const nightly = createCronSchedule("30 2 * * *", { timeZone: "Europe/Paris" });
console.log(nightly.next(new Date("2026-03-28T12:00:00Z")).toISOString());
```

<!-- check:run -->

This prints `2026-03-30T00:30:00.000Z`: 02:30 does not exist in Paris on 29 March 2026.

A CI schedule, such as a GitHub Actions `schedule` workflow running a script, is an alternative when no long-running process is available.

## Receive webhooks

`serveTriggers()` starts an HTTP server. Each route verifies requests with a source, then `on()` maps the event to a job or ignores it by returning `undefined`.

```ts
import {
  createGithubWebhook,
  labelAdded,
  serveTriggers,
  createSqliteTaskQueue,
} from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const secret = process.env.GITHUB_WEBHOOK_SECRET;
if (!secret) throw new Error("Set GITHUB_WEBHOOK_SECRET");
const server = await serveTriggers({
  queue,
  port: 8787,
  routes: [
    {
      path: "/github",
      source: createGithubWebhook({ secret }),
      on(event) {
        const issue = labelAdded(event, "outpost:fix");
        if (!issue) return undefined;
        return {
          handler: "fix",
          runId: `${issue.repository}#${issue.number}`,
          input: { repository: issue.repository, issue: issue.number },
        };
      },
    },
  ],
  onError: (error, failure) => console.error(failure, error),
});
console.log(`Listening on ${server.url}`);
```

The job identifier is `trigger:<path>:<delivery>`. A sender retry or a manual redelivery keeps its delivery identifier, so it does not publish a second job. A different delivery for the same `runId`, such as the label being added again, runs the job again: `defineWorkflowJob()` restores the tasks already completed in that run's checkpoint.

| Response  | Meaning                                                                               |
| --------- | ------------------------------------------------------------------------------------- |
| `202`     | Job published, or already present for this delivery. The body is `{"job": "<id>"}`.   |
| `204`     | Verified event ignored by `on()`.                                                     |
| `401`     | Verification failed: signature, secret source, timestamp window or a required header. |
| `404/405` | Unknown path, or a method other than `POST`.                                          |
| `413`     | Body larger than `maxBytes` (1 MiB by default, up to 25 MiB).                         |
| `500`     | `on()` threw or returned an invalid job.                                              |
| `503`     | The queue rejected the job; the sender may retry the same delivery.                   |

Slack routes answer `200` with an empty body instead of `202` and `204`, because Slack expects `200`. `onError` receives failures at the `verify`, `route` and `enqueue` stages, never the secrets. Keep `on()` fast: GitHub waits 10 seconds for a response and Slack 3 seconds.

## Sources

| Source                                  | Verification                                                                             | Delivery identifier                           | Actor               |
| --------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------- |
| `createGithubWebhook({ secret })`       | `X-Hub-Signature-256` (HMAC-SHA256 of the body); JSON or form payloads.                  | `X-GitHub-Delivery`                           | `github:<login>`    |
| `createGitlabWebhook({ signingToken })` | `webhook-signature` with a `whsec_` signing token (GitLab 19.0+), 5-minute window.       | `webhook-id`                                  | `gitlab:<username>` |
| `createGitlabWebhook({ token })`        | `X-Gitlab-Token` compared in constant time.                                              | `Idempotency-Key`, else `X-Gitlab-Event-UUID` | `gitlab:<username>` |
| `createSlackSource({ signingSecret })`  | `X-Slack-Signature` over `v0:timestamp:body`, 5-minute window.                           | `trigger_id`                                  | `slack:<user id>`   |
| `createStandardWebhook({ secret })`     | [Standard Webhooks](https://www.standardwebhooks.com/) `whsec_` secret, 5-minute window. | `webhook-id`                                  | none                |

Prefer a GitLab signing token: a plain `X-Gitlab-Token` is sent as is and does not sign the body. Slack sources accept slash commands and interactive payloads; the Events API and its URL verification challenge are not supported. Every secret can be a callback returning the currently accepted values; during a rotation, return both the old and the new secret. An empty or failing source denies every request.

`TriggerEvent` exposes `source`, `delivery`, `kind` (GitHub event, GitLab `object_kind`, `command` or the Slack interaction type), `action`, `actor` and the parsed `payload`. `labelAdded(event, label)` recognizes a label just added to a GitHub issue or pull request, or to a GitLab issue or merge request. `commandIssued(event, "/outpost")` returns the text after the command in a new GitHub or GitLab comment, or in a Slack slash command.

## Authorize senders

A verified signature proves that the request comes from the configured GitHub, GitLab or Slack integration. It does not prove that the person behind the event may start a workflow. Anyone who can comment on a public repository can write `/outpost`; check `event.actor` against an explicit list:

```ts
import { commandIssued } from "@elie-laloum/outpost";
import type { TriggerEvent, TriggerJob } from "@elie-laloum/outpost";

const maintainers = new Set(["github:octocat", "slack:U012AB3CD"]);

function fromCommand(event: TriggerEvent): TriggerJob | undefined {
  const command = commandIssued(event, "/outpost");
  if (!command || !event.actor || !maintainers.has(event.actor)) return;
  return {
    handler: "fix",
    runId: `${command.repository ?? "slack"}#${command.number ?? event.delivery}`,
    input: { request: command.text },
  };
}
```

The actor is the sender's identity, not an Outpost gate actor. [Review gates](../review-gates/) keep their own authorization.

## Run the workflow

`defineWorkflowJob({ workflow, checkpoint, start })` returns a queue handler. For each job it builds the workflow from `input`, then starts it with the job's `runId` as checkpoint run and the job's cancellation signal. The same input must build the same workflow.

- **Checkpoint version.** The run's version is `checkpoint.version` followed by a digest of the input. The same `runId` with a different input is rejected by the checkpoint identity check instead of mixing two requests in one run.
- **Result.** The job value reports `runId`, the effective checkpoint `version`, `executionId`, `status`, each task's status, pending gates (`pauses`) and `inputRequests`. Usage is the workflow's cumulative token usage.
- **Failures.** A `failed` or `cancelled` workflow completes the job with an error. A paused or waiting run completes the job normally with that status.
- **Concurrency.** A checkpoint has one owner at a time: a second job for a run that is still executing fails, and its delivery can be sent again later.
- **Gates.** To approve a paused run, submit the [decision](../review-gates/#submit-a-decision) to the same workflow with `checkpoint: { store, runId, version }` from the job value.

`start` passes other workflow options, such as `concurrency`, `budget`, `onQuota` or `timeoutMs`. Replaying incomplete tasks still requires `checkpoint.resume: "retry-incomplete"`, as for any [durable run](../durable-runs/).

## Operate the server

`serveTriggers()` listens on `127.0.0.1` by default. Expose it through a reverse proxy that terminates TLS; senders only need that single path. Close the returned server, then its queue, during shutdown.

Deduplication lasts as long as the queue retains the job. GitHub signatures have no timestamp, so a captured request could be sent again under a new delivery identifier: deliver over TLS and derive `runId` from the payload, as above, so that a replayed event converges on the same checkpoint. Trigger jobs do not make external effects exactly-once; follow [idempotency keys](../background-jobs/#deduplicate-effects) in handlers that publish results.

## Limits

Outpost does not call GitHub, GitLab or Slack APIs: posting a comment or a message about the result belongs to your workflow. Approving a gate from a comment or a Slack button, a CLI command to run the server and the Slack Events API are not provided. Tests use locally computed signatures and simulated senders, not live integrations.

API: [createCronSchedule](../../reference/createcronschedule/) · [runSchedules](../../reference/runschedules/) · [serveTriggers](../../reference/servetriggers/) · [createGithubWebhook](../../reference/creategithubwebhook/) · [createGitlabWebhook](../../reference/creategitlabwebhook/) · [createSlackSource](../../reference/createslacksource/) · [createStandardWebhook](../../reference/createstandardwebhook/) · [defineWorkflowJob](../../reference/defineworkflowjob/).
