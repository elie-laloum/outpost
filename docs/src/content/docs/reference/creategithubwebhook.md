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

Create a GitHub trigger source. It verifies X-Hub-Signature-256 against every current secret in constant time, accepts JSON and form payloads, and reports X-GitHub-Delivery, the X-GitHub-Event name, the payload action and the sender as github:<login>. GitHub signatures carry no timestamp.

[Complete example and detailed rules](../../guide/triggers/).

## Parameters and properties

| Name             | Type                   | Presence | Meaning                                                                                                                                                                                                      |
| ---------------- | ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`        | `GithubWebhookOptions` | Required | GitHub webhook secret settings.                                                                                                                                                                              |
| `options.secret` | `TriggerSecret`        | Required | GitHub webhook secret verifying X-Hub-Signature-256. Secret, or callback returning every currently accepted secret; return old and new values during a rotation. An empty or failing source denies requests. |

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
