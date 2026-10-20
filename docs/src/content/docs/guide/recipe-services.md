---
title: "Queue a recipe and start a worker"
description: "Run durable recipes from a queue, a schedule or a verified webhook."
---

Start with the two version-3 files from [Save and resume a recipe](../recipe-durability/). Add the blocks below to `outpost.yaml`. Declarations alone start nothing: a service runs only through `recipe serve`.

## Declare the queue and worker

This SQLite queue stores jobs locally. The `review` handler executes your checkpointed recipe. Keep the existing `transports` and `stores` declarations.

```yaml title="outpost.yaml — queue and worker"
queues:
  jobs: { type: sqlite, file: ./.outpost/jobs.sqlite }
jobs:
  review:
    type: recipe
    file: ./recipe.yaml
    config: ./outpost.yaml
services:
  worker:
    type: worker
    queue: { $ref: queues.jobs }
    worker: local-review-worker
    handlers:
      review: { $ref: jobs.review }
```

## Publish and process a job

The first command only enqueues work and prints its receipt. The second starts the worker and stays active until Ctrl+C. For this approval recipe, the execution waits at its gate; inspect it with `recipe status --run-id change-42` and the same `--file` and `--config`.

```sh
npx outpost recipe enqueue --file recipe.yaml --config outpost.yaml   --queue jobs --handler review --run-id change-42 --json
npx outpost recipe serve --file recipe.yaml --config outpost.yaml   --service worker
```

The default job ID is `recipe:<handler>:<run-id>`. Repeated publication converges on the same request. To enqueue a later resume, use a new `--job-id`; preserve the intended effect key with `--idempotency-key`. External services must deduplicate their own effects.

For HTTP or BullMQ, replace the queue with the appropriate [queue component](../yaml-components/). See [queue ownership and leases](../job-queues/); the worker closes owned queues, not borrowed extensions.

## Publish on a schedule

Add these top-level declarations. This recipe has no inputs, so its scheduled input is empty. A recipe with parameters uses their names here.

```yaml title="outpost.yaml — schedule"
crons:
  hourly: { type: schedule, expression: "0 * * * *", timeZone: UTC }
schedules:
  review:
    type: cron
    name: hourly-review
    cron: { $ref: crons.hourly }
    handler: review
    input: {}
```

Add `clock` **inside the existing `services` mapping**, beside `worker`. Start it in another terminal with `recipe serve --file recipe.yaml --config outpost.yaml --service clock`.

```yaml title="outpost.yaml — add under services"
clock:
  type: schedules
  queue: { $ref: queues.jobs }
  schedules: [{ $ref: schedules.review }]
```

The clock publishes jobs; the worker executes them. Slot IDs deduplicate restarts, and only the latest eligible missed slot is caught up. See [cron scheduling](../cron-schedules/) for time zones and late slots.

## Publish from a verified webhook

Add these top-level declarations and set `GITHUB_WEBHOOK_SECRET` on the host. This route accepts the selected pull-request events and submits the same recipe with no inputs.

```yaml title="outpost.yaml — webhook source and route"
triggers:
  github: { type: github, secret: { env: GITHUB_WEBHOOK_SECRET } }
routes:
  review:
    type: job
    handler: review
    kinds: [pull_request]
    actions: [opened, synchronize]
    runIdPrefix: review
    input: {}
```

Add `webhooks` **under the existing `services` mapping**. Start it separately with `--service webhooks`. The server binds to localhost by default and verifies requests before queue publication.

```yaml title="outpost.yaml — add under services"
webhooks:
  type: triggers
  queue: { $ref: queues.jobs }
  port: 8080
  routes:
    - path: /github
      source: { $ref: triggers.github }
      on: { $ref: routes.review }
```

Use [webhook deployment](../operating-webhooks/) for public HTTPS and provider setup. Verified sender identity does not authorize approval gates. GitLab, Slack and Standard Webhooks use their own source components.

## Wait for a queued result

A recipe can use a `queued` task to wait for a handler result. See [defineQueuedTask](../../reference/definequeuedtask/) for polling, cancellation, quota and usage behavior; declare queue references in configuration and build the handler payload with `arguments`.

Local and real Redis tests cover service composition. Hosted Redis, public webhook delivery and live cloud restoration need separate validation.

<!-- Retained section anchors for existing bookmarks. -->

<span id="declare-a-queue-and-recipe-job"></span>
<span id="start-one-worker-explicitly"></span>
<span id="publish-on-schedules-or-authenticated-webhooks"></span>
<span id="wait-for-queued-work-inside-a-recipe"></span>
<span id="file-workspaces"></span>
