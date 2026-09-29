---
title: "standardWebhook"
description: "standardWebhook — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { standardWebhook } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a trigger source for senders that follow the Standard Webhooks scheme. It verifies every v1 signature of webhook-signature over id.timestamp.body with whsec_ secrets within a timestamp window, uses webhook-id as delivery and the payload type field, or webhook, as kind. It reports no actor.

[Complete example and detailed rules](../../guide/triggers/).

## Parameters and properties

| Name                  | Type                     | Presence | Meaning                                                                                                                                                                                            |
| --------------------- | ------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `StandardWebhookOptions` | Required | Signing secret, timestamp window and source name.                                                                                                                                                  |
| `options.secret`      | `TriggerSecret`          | Required | whsec_ secret verifying webhook-signature. Secret, or callback returning every currently accepted secret; return old and new values during a rotation. An empty or failing source denies requests. |
| `options.toleranceMs` | `number \| undefined`    | Optional | Accepted clock difference for the request timestamp, in milliseconds; defaults to 300000 (5 minutes).                                                                                              |
| `options.source`      | `string \| undefined`    | Optional | Name reported in TriggerEvent.source; defaults to standard.                                                                                                                                        |

## Returns

`TriggerSource`

## Signature

```ts
export declare function standardWebhook(
  options: StandardWebhookOptions,
): TriggerSource;
```

## Related contracts

- [StandardWebhookOptions](../standardwebhookoptions/)
- [TriggerSource](../triggersource/)
