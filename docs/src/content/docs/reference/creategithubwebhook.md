---
title: "createGithubWebhook"
description: "createGithubWebhook — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createGithubWebhook } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a GitHub trigger source. It verifies X-Hub-Signature-256 against every current secret in constant time, accepts JSON and form payloads, and reports X-GitHub-Delivery, the X-GitHub-Event name, the payload action and the sender as github:&lt;login>. GitHub signatures carry no timestamp.

[Complete example and detailed rules](../../guide/webhooks/).

## Parameters and properties

| Name             | Type                   | Presence | Meaning                                                                                                                                                                                                                                |
| ---------------- | ---------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`        | `GithubWebhookOptions` | Required | GitHub webhook secret settings.                                                                                                                                                                                                        |
| `options.secret` | `TriggerSecret`        | Required | Webhook secret verifying X-Hub-Signature-256, or a callback returning every currently accepted secret (old and new during a rotation). An empty string throws at creation; a callback that fails or returns no secret denies requests. |

## Returns

`TriggerSource`

## Signature

```ts
export declare function createGithubWebhook(
  options: GithubWebhookOptions,
): TriggerSource;
```

## Related contracts

- [GithubWebhookOptions](../githubwebhookoptions/)
- [TriggerSource](../triggersource/)
