---
title: "Triggers — Overview"
description: "Turn cron slots and verified webhooks into deterministic queue jobs that run checkpointed workflows."
sidebar:
  label: Overview
  order: 0
---

## Choose a trigger source

A schedule publishes from a local timer. A webhook source verifies each request before parsing its body and answers 401 on any failure, including a missing or unusable secret.

| Source                                       | Verifies                                                                  | Job id                                                       | `actor`             |
| -------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------- |
| `runSchedules()` with `createCronSchedule()` | Nothing: slots come from the cron expression and time zone                | `schedule:<name>:<slot ISO time>`                            | None                |
| `createGithubWebhook()`                      | `X-Hub-Signature-256` over the body, no timestamp                         | `trigger:<path>:<X-GitHub-Delivery>`                         | `github:<login>`    |
| `createGitlabWebhook()`                      | `webhook-signature` with `signingToken`, or `X-Gitlab-Token` with `token` | `trigger:<path>:<webhook-id, Idempotency-Key or event UUID>` | `gitlab:<username>` |
| `createSlackSource()`                        | `X-Slack-Signature` over timestamp and body, within `toleranceMs`         | `trigger:<path>:<trigger_id>`                                | `slack:<user id>`   |
| `createStandardWebhook()`                    | Standard Webhooks `webhook-signature` over id, timestamp and body         | `trigger:<path>:<webhook-id>`                                | None                |

:::caution
`actor` is the identity the verified sender reports, not an Outpost gate actor. Check it against an allowlist in `on()` before publishing work.
:::

## How jobs converge

Job ids derive from the slot or the delivery, so replicas, restarts and redeliveries publish the same job. Deduplication lasts as long as the queue retains the job.

| Situation                                            | Outcome                                                                     |
| ---------------------------------------------------- | --------------------------------------------------------------------------- |
| Several scheduler replicas reach the same slot       | One job                                                                     |
| Scheduler starts or wakes after missed slots         | Only the latest slot within `maxLateMs` (default 60000) is published        |
| Wall-clock time skipped by daylight saving           | No slot                                                                     |
| Wall-clock time repeated by daylight saving          | One slot, at its first occurrence                                           |
| Sender redelivers a delivery                         | Same job, nothing new published; the reply is repeated                      |
| `on()` maps a known delivery to a different job      | The queue refuses it and the server answers 503                             |
| New delivery or slot with the same `runId` and input | New job; `defineWorkflowJob()` restores completed tasks from the checkpoint |
| Same `runId` with a different input                  | The checkpoint is incompatible and the job completes with an error          |

## Entry points

Guide: [Webhooks](../../../guide/webhooks/) · [Cron schedules](../../../guide/cron-schedules/) · [Job queues and workers](../../../guide/job-queues/)

- [runSchedules](../../runschedules/)
- [createCronSchedule](../../createcronschedule/)
- [serveTriggers](../../servetriggers/)
- [createGithubWebhook](../../creategithubwebhook/)
- [createGitlabWebhook](../../creategitlabwebhook/)
- [createSlackSource](../../createslacksource/)
- [createStandardWebhook](../../createstandardwebhook/)
- [labelAdded](../../labeladded/)
- [commandIssued](../../commandissued/)
- [defineWorkflowJob](../../defineworkflowjob/)
- [TriggerEvent](../../triggerevent/)
- [TriggerJob](../../triggerjob/)
