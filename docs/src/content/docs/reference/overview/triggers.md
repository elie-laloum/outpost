---
title: "Triggers — Overview"
description: "Triggers turn cron slots and verified webhooks into queue jobs that run checkpointed workflows."
sidebar:
  label: Overview
  order: 0
---

Triggers start workflows from time or from outside events without running them inside the timer or HTTP request that fires them. Every trigger publishes a queue job carrying a `runId` and a JSON input; a queue worker then runs the workflow with a checkpoint.

## How it works

`createCronSchedule` describes wall-clock slots in an IANA time zone, and `runSchedules` publishes one job per slot. `serveTriggers` receives webhooks: each route verifies requests with a source (`createGithubWebhook`, `createGitlabWebhook`, `createSlackSource` or `createStandardWebhook`) and maps the normalized `TriggerEvent` to a `TriggerJob`. `labelAdded` and `commandIssued` read common GitHub, GitLab and Slack payloads. On the worker side, `defineWorkflowJob` turns each job into a checkpointed workflow run.

Job identifiers derive from the schedule slot or the delivery, so replicas, restarts and redeliveries converge on one job. Several events for the same `runId` share one checkpoint, and completed tasks are restored rather than executed again.

## Boundaries and responsibilities

A verified signature authenticates the sending integration, not the person behind the event: authorize `TriggerEvent.actor` explicitly before publishing work. Deduplication lasts as long as the queue retains the job, and external effects remain at least once. Outpost does not call GitHub, GitLab or Slack APIs, and gate approvals from these services are not provided.

## Entry points

- [createCronSchedule](../../createcronschedule/)
- [runSchedules](../../runschedules/)
- [serveTriggers](../../servetriggers/)
- [createGithubWebhook](../../creategithubwebhook/)
- [createGitlabWebhook](../../creategitlabwebhook/)
- [createSlackSource](../../createslacksource/)
- [createStandardWebhook](../../createstandardwebhook/)
- [defineWorkflowJob](../../defineworkflowjob/)

[Learn with the practical guide](../../../guide/triggers/).
