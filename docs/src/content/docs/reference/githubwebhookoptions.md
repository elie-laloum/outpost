---
title: "GithubWebhookOptions"
description: "GithubWebhookOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { GithubWebhookOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type            | Presence | Meaning                                                                                                                                                                                                      |
| -------- | --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `secret` | `TriggerSecret` | Required | GitHub webhook secret verifying X-Hub-Signature-256. Secret, or callback returning every currently accepted secret; return old and new values during a rotation. An empty or failing source denies requests. |

## Signature

```ts
export interface GithubWebhookOptions {
  /** Webhook secret verifying `X-Hub-Signature-256`. */
  readonly secret: TriggerSecret;
}
```

## Related contracts

- [TriggerSecret](../triggersecret/)
