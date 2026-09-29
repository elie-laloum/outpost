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

Create a Slack trigger source for slash commands and interactive payloads. It verifies X-Slack-Signature over v0:timestamp:body within a timestamp window, uses trigger_id as delivery, reports command or the interaction type with the user as slack:<user id>, and replies 200 with an empty body. The Events API is not supported.

[Complete example and detailed rules](../../guide/webhooks/).

## Parameters and properties

| Name                    | Type                  | Presence | Meaning                                                                                                                                                                                                       |
| ----------------------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`               | `SlackRequestOptions` | Required | Slack app signing secret and timestamp window.                                                                                                                                                                |
| `options.signingSecret` | `TriggerSecret`       | Required | Slack app signing secret verifying X-Slack-Signature. Secret, or callback returning every currently accepted secret; return old and new values during a rotation. An empty or failing source denies requests. |
| `options.toleranceMs`   | `number \| undefined` | Optional | Accepted clock difference for the request timestamp, in milliseconds; defaults to 300000 (5 minutes).                                                                                                         |

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
