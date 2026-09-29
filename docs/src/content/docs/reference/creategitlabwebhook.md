---
title: "createGitlabWebhook"
description: "createGitlabWebhook — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createGitlabWebhook } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a GitLab trigger source. With signingToken it verifies the webhook-signature header of a whsec_ signing token (GitLab 19.0+) within a timestamp window and uses webhook-id; with token it compares X-Gitlab-Token and uses Idempotency-Key or X-Gitlab-Event-UUID. It reports object_kind, the object action and the user as gitlab:<username>.

[Complete example and detailed rules](../../guide/triggers/).

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name                   | Type                   | Presence          | Meaning                                                                                                                                                                                                                                         |
| ---------------------- | ---------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`              | `GitlabWebhookOptions` | Required          | Either signingToken (recommended, signs the body) or token (legacy plain-text header), not both.                                                                                                                                                |
| `options.signingToken` | `TriggerSecret`        | Variant-dependent | whsec_ signing token of the GitLab webhook (GitLab 19.0+), verifying webhook-signature. Secret, or callback returning every currently accepted secret; return old and new values during a rotation. An empty or failing source denies requests. |
| `options.toleranceMs`  | `number \| undefined`  | Variant-dependent | Accepted clock difference for the request timestamp, in milliseconds; defaults to 300000 (5 minutes).                                                                                                                                           |
| `options.token`        | `TriggerSecret`        | Variant-dependent | Secret token compared with X-Gitlab-Token; weaker because the body is not signed. Secret, or callback returning every currently accepted secret; return old and new values during a rotation. An empty or failing source denies requests.       |

## Returns

`TriggerSource`

## Signature

```ts
export declare function createGitlabWebhook(
  options: GitlabWebhookOptions,
): TriggerSource;
```

## Related contracts

- [GitlabWebhookOptions](../gitlabwebhookoptions/)
- [TriggerSource](../triggersource/)
