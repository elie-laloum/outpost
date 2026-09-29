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

| Name            | Type                  | Presence | Meaning                                                                                                                                                                                                                                      |
| --------------- | --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signingSecret` | `TriggerSecret`       | Required | Slack app signing secret verifying X-Slack-Signature, or a callback returning every currently accepted secret (old and new during a rotation). An empty string throws at creation; a callback that fails or returns nothing denies requests. |
| `toleranceMs`   | `number \| undefined` | Optional | Accepted clock difference for the request timestamp, in milliseconds; defaults to 300000 (5 minutes). A value that is not a positive integer throws at creation.                                                                             |

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
