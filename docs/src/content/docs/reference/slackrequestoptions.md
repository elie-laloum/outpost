---
title: "SlackRequestOptions"
description: "SlackRequestOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SlackRequestOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                  | Presence | Meaning                                                                                                                                                                                                       |
| --------------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signingSecret` | `TriggerSecret`       | Required | Slack app signing secret verifying X-Slack-Signature. Secret, or callback returning every currently accepted secret; return old and new values during a rotation. An empty or failing source denies requests. |
| `toleranceMs`   | `number \| undefined` | Optional | Accepted clock difference for the request timestamp, in milliseconds; defaults to 300000 (5 minutes).                                                                                                         |

## Signature

```ts
export interface SlackRequestOptions {
  /** App signing secret verifying `X-Slack-Signature`. */
  readonly signingSecret: TriggerSecret;
  readonly toleranceMs?: number;
}
```

## Related contracts

- [TriggerSecret](../triggersecret/)
