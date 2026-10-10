---
title: Recipe jobs and services
description: Publish recipe jobs and explicitly start workers, schedules and webhook services.
---

Prepare a [recipe configuration](../recipe-configuration/) and a [durable recipe](../recipe-durability/) before running them in a worker. The configuration snippets below extend that file; their declarations alone start no background service.

Configuration format 2 declares queues, jobs and services alongside agents and storage. Reading or validating these declarations starts no server, worker or schedule. `recipe enqueue` publishes a job; `recipe serve --service` starts exactly the selected service and its dependencies. [Durable recipes](../recipe-durability/) explains the checkpoints used by recipe jobs.

## Declare a queue and recipe job

A SQLite queue stores jobs locally. HTTP queues use `type: http`, a URL and an environment or rotation-callback token reference. BullMQ queues use `type: bullmq` with native Redis connection options and the optional BullMQ package. Their ownership, fencing and deduplication contracts are unchanged; see [queues](../job-queues/).

```yaml title="outpost.yaml — jobs"
queues:
  jobs: { type: sqlite, file: ./.outpost/jobs.sqlite }
jobs:
  review:
    type: recipe
    file: ./recipe.yaml
    config: ./outpost.yaml
```

A `recipe` job accepts `{ runId, input }`, where `input` is a mapping of recipe parameters or null. It creates a fresh runtime, starts or resumes that checkpoint, then closes its resources. The target recipe must configure a checkpoint store supporting inspection. Parameters remain part of the durable identity; a changed input cannot silently reuse an existing run. Optional `retryIncomplete: true` explicitly authorizes interrupted replay for this handler. For a trusted TypeScript workflow factory, use `type: workflow` with the native [WorkflowJobOptions](../../reference/workflowjoboptions/) and a local callback reference.

## Start one worker explicitly

A worker maps handler names to declared jobs. Merely declaring it does not claim work. The worker runs the existing queue engine, renews leases and closes its owned queue when stopped. Queues supplied as borrowed extensions stay under their caller's ownership.

```yaml title="outpost.yaml — worker"
services:
  worker:
    type: worker
    queue: { $ref: queues.jobs }
    worker: local-review-worker
    handlers:
      review: { $ref: jobs.review }
```

Publish from one terminal and start the worker from another. Enqueue is silent unless `--json` requests the queue receipt. The default job ID is `recipe:<handler>:<run-id>`; duplicate publication converges on the same request. For a later resume of a paused run, choose a new `--job-id` while preserving the intended effect identity with `--idempotency-key`. External effects still need persistent deduplication at their destination.

```sh
outpost recipe enqueue --file recipe.yaml --config outpost.yaml \
  --queue jobs --handler review --run-id change-42 --json
outpost recipe serve --file recipe.yaml --config outpost.yaml \
  --service worker
```

`serve` stays active until interrupted or its runtime is closed. It emits no implicit progress. Each executed recipe keeps its declared observation and report settings; failed jobs retain their native queue result, and recipe execution state remains available through `recipe status`. `examples/70-recipe-services/` demonstrates an offline SQLite worker and durable result inspection.

## Publish on schedules or authenticated webhooks

Cron components retain native wall-clock and timezone behavior. A schedule publishes only the latest eligible slot under `schedule:<name>:<slot>`; it never calls a workflow. `input` can be fixed JSON or a local callback, and a `runId` callback can override the default checkpoint ID. Start the schedule service explicitly, independently of the worker.

```yaml title="outpost.yaml — schedules"
crons:
  hourly: { type: schedule, expression: "0 * * * *", timeZone: UTC }
schedules:
  review:
    type: cron
    name: hourly-review
    cron: { $ref: crons.hourly }
    handler: review
    input: { goal: Review recent commits. }
services:
  clock:
    type: schedules
    queue: { $ref: queues.jobs }
    schedules: [{ $ref: schedules.review }]
```

Webhook sources support GitHub, GitLab, Slack and Standard Webhooks with their native verification options. Secrets use environment references or explicitly declared rotation callbacks. A `job` route mapper filters event kinds/actions, chooses a handler and constructs a checkpoint ID from source/prefix and delivery. Its default input is the authenticated event payload; fixed `input` or a local `triggerMapper` extension can adapt it to the recipe's parameters. Authenticated sender identities do not become authorized gate actors.

```yaml title="outpost.yaml — verified webhook source"
triggers:
  github: { type: github, secret: { env: GITHUB_WEBHOOK_SECRET } }
routes:
  review:
    type: job
    handler: review
    kinds: [pull_request]
    actions: [opened, synchronize]
    runIdPrefix: review
    input: { goal: Review recent commits. }
```

Bind that source and mapper to an exact path. The native server verifies the request before invoking the mapper and publishes `trigger:<path>:<delivery>` jobs. `type: queue` similarly serves the native authenticated HTTP queue protocol with `queue`, `token`, `host` and `port`; it does not start a worker. Servers bind to localhost by default. Use the existing [trigger guide](../webhooks/) for transport and signature requirements.

```yaml title="outpost.yaml — webhook service"
services:
  webhooks:
    type: triggers
    queue: { $ref: queues.jobs }
    port: 8080
    routes:
      - path: /github
        source: { $ref: triggers.github }
        on: { $ref: routes.review }
```

## Wait for queued work inside a recipe

A `queued` task uses [defineQueuedTask](../../reference/definequeuedtask/) and its native polling, cancellation, usage and quota behavior. `arguments` builds the handler input. A local `queued.input` callback can replace that expression, while `queued.decode` can customize the JSON result. The default projection exposes the decoded value under `value`.

```yaml title="recipe.yaml — queued task"
- key: remote-review
  queued:
    queue: { $ref: queues.jobs }
    handler: review
  arguments:
    runId: change-42
    input: { goal: Review recent commits. }
```

Local process tests cover silent publication, explicit startup, cancellation, token rotation, signed webhooks, schedule publication and native workflow jobs. Real Redis 7 tests cover BullMQ leases, stale writers, interrupted effects and YAML workers. No paid model calls or public webhook endpoint are used; production TLS, hosted Redis and live sender delivery remain unvalidated.

## File workspaces

To run a service without Git, use configuration version 3 with an explicit file source for sandbox tasks, or omit workspace and sandbox for fileless tasks. Named queues, schedules, webhooks and jobs retain their existing contracts. See [file workspaces](../workspaces/).
