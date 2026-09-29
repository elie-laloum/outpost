---
title: "GitlabWebhookOptions"
description: "GitlabWebhookOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { GitlabWebhookOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name           | Type                  | Presence          | Meaning                                                                                                                                                                                                                                         |
| -------------- | --------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signingToken` | `TriggerSecret`       | Variant-dependent | whsec_ signing token of the GitLab webhook (GitLab 19.0+), verifying webhook-signature. Secret, or callback returning every currently accepted secret; return old and new values during a rotation. An empty or failing source denies requests. |
| `toleranceMs`  | `number \| undefined` | Variant-dependent | Accepted clock difference for the request timestamp, in milliseconds; defaults to 300000 (5 minutes).                                                                                                                                           |
| `token`        | `TriggerSecret`       | Variant-dependent | Secret token compared with X-Gitlab-Token; weaker because the body is not signed. Secret, or callback returning every currently accepted secret; return old and new values during a rotation. An empty or failing source denies requests.       |

## Signature

```ts
export type GitlabWebhookOptions = GitlabSigningOptions | GitlabTokenOptions;
```

## Related contracts

- [GitlabSigningOptions](../gitlabsigningoptions/)
- [GitlabTokenOptions](../gitlabtokenoptions/)
