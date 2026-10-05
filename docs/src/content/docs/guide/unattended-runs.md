---
title: "Automate your runs"
description: "Choose CI, queues, schedules or webhooks to start work without an interactive session."
---

## Choose what starts the work

Choose how work should start: a CI job, a queued request, a schedule or a verified event. The workflow still runs from your TypeScript code; the entry point decides when to submit it.

<!-- features -->

- [Run in CI](../ci-automation/): A pipeline job runs your script with an API key and fails on your checks.
  - API key
  - exit status
- [Job queues and workers](../job-queues/): Producers submit jobs, long-running workers claim and run them.
  - SQLite
  - HTTP
- [Redis and BullMQ](../redis-workers/): One queue shared by producers and workers on several machines.
  - Redis
  - BullMQ
- [Cron schedules](../cron-schedules/): A deterministic job per slot, in your time zone, without duplicates.
  - slots
- [Webhooks](../webhooks/): A verified GitHub, GitLab or Slack event becomes a job.
  - GitHub
  - GitLab
  - Slack
- [Durable runs](../durable-runs/): Each job runs under a checkpoint, so a restart resumes instead of restarting.
  - checkpoints

## Run work as it arrives

A worker process registers the handlers it knows and runs one job at a time until its signal aborts. Producers never send code, only a handler name and JSON input.

```ts title="worker.ts"
import { createSqliteTaskQueue, runQueueWorker } from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runQueueWorker({
    queue,
    worker: "worker-1",
    signal: stop.signal,
    handlers: {
      count: (input) => ({ value: Array.isArray(input) ? input.length : 0 }),
    },
  });
} finally {
  queue.close();
}
```

Wrap the workflow itself in `defineWorkflowJob()` to get a checkpointed run per job, keyed by the job's `runId`. Schedules and webhooks publish into the same queue, so the worker is the only process that runs agents.

## Compare entry points

| Starts a run                          | Use                                  | Keeps running                  |
| ------------------------------------- | ------------------------------------ | ------------------------------ |
| A commit or a pipeline stage          | [Run in CI](../ci-automation/)       | Only for the length of the job |
| Your own code or a service            | [Job queues](../job-queues/)         | Workers you operate            |
| The clock                             | [Cron schedules](../cron-schedules/) | A scheduler plus workers       |
| An event from GitHub, GitLab or Slack | [Webhooks](../webhooks/)             | An HTTP server plus workers    |

Triggers never run a workflow inside the request or timer that fired them. They publish a deterministic job, so a redelivery, a restart or a second replica converges on one run.

## Limits

- Job inputs and values are JSON, up to 256 KiB each; one job at a time per `runId`.
- A queue fences stale leases, but external effects are exactly-once only if the service you call deduplicates your idempotency key.
- A webhook source verifies the signature before parsing and fails closed; a verified sender is not an approval, so [gates](../approvals/) still need their own actor.
- A skipped daylight-saving slot does not fire, a repeated one fires once, and only the latest slot within `maxLateMs` is caught up.
- An unattended run with no person watching still needs a budget: pair it with [quota pauses](../quota-pauses/) and [budgets](../budgets/).

API: [runQueueWorker](../../reference/runqueueworker/) · [createSqliteTaskQueue](../../reference/createsqlitetaskqueue/) · [TaskQueue](../../reference/taskqueue/) · [defineWorkflowJob](../../reference/defineworkflowjob/) · [createCronSchedule](../../reference/createcronschedule/) · [runSchedules](../../reference/runschedules/) · [serveTriggers](../../reference/servetriggers/) · [createGithubWebhook](../../reference/creategithubwebhook/).
