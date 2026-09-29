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

| Name     | Type            | Presence | Meaning                                                                                                                                                                                                                                |
| -------- | --------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `secret` | `TriggerSecret` | Required | Webhook secret verifying X-Hub-Signature-256, or a callback returning every currently accepted secret (old and new during a rotation). An empty string throws at creation; a callback that fails or returns no secret denies requests. |

## Signature

```ts
export interface GithubWebhookOptions {
  /** Webhook secret verifying `X-Hub-Signature-256`. */
  readonly secret: TriggerSecret;
}
```

## Related contracts

- [TriggerSecret](../triggersecret/)
