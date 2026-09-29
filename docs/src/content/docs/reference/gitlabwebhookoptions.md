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

| Name           | Type                  | Presence          | Meaning                                                                                                                                                                                                                                                                                                             |
| -------------- | --------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signingToken` | `TriggerSecret`       | Variant-dependent | whsec_ signing token of the GitLab webhook (GitLab 19.0+) verifying webhook-signature, or a callback returning every currently accepted token (old and new during a rotation). An empty string throws at creation; a callback that fails or returns nothing, or a token without the whsec_ prefix, denies requests. |
| `toleranceMs`  | `number \| undefined` | Variant-dependent | Accepted clock difference for the request timestamp, in milliseconds; defaults to 300000 (5 minutes). A value that is not a positive integer throws at creation.                                                                                                                                                    |
| `token`        | `TriggerSecret`       | Variant-dependent | Secret token compared in constant time with X-Gitlab-Token, or a callback returning every currently accepted token; weaker because the body is not signed. An empty string throws at creation; a callback that fails or returns nothing denies requests.                                                            |

## Signature

```ts
export type GitlabWebhookOptions = GitlabSigningOptions | GitlabTokenOptions;
```

## Related contracts

- [GitlabSigningOptions](../gitlabsigningoptions/)
- [GitlabTokenOptions](../gitlabtokenoptions/)
