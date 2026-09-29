---
title: "createSlackSource"
description: "createSlackSource — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createSlackSource } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a Slack trigger source for slash commands and interactive payloads. It verifies X-Slack-Signature over v0:timestamp:body within a timestamp window and uses trigger_id as delivery, rejecting requests without one; kind is command or the interaction type, and actor is slack:&lt;user id>. It replies 200 with an empty body; the Events API is not supported.

[Complete example and detailed rules](../../guide/webhooks/).

## Parameters and properties

| Name                    | Type                  | Presence | Meaning                                                                                                                                                                                                                                      |
| ----------------------- | --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`               | `SlackRequestOptions` | Required | Slack app signing secret and timestamp window.                                                                                                                                                                                               |
| `options.signingSecret` | `TriggerSecret`       | Required | Slack app signing secret verifying X-Slack-Signature, or a callback returning every currently accepted secret (old and new during a rotation). An empty string throws at creation; a callback that fails or returns nothing denies requests. |
| `options.toleranceMs`   | `number \| undefined` | Optional | Accepted clock difference for the request timestamp, in milliseconds; defaults to 300000 (5 minutes). A value that is not a positive integer throws at creation.                                                                             |

## Returns

`TriggerSource`

## Signature

```ts
export declare function createSlackSource(
  options: SlackRequestOptions,
): TriggerSource;
```

## Related contracts

- [SlackRequestOptions](../slackrequestoptions/)
- [TriggerSource](../triggersource/)
