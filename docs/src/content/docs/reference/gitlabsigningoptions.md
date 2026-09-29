---
title: "GitlabSigningOptions"
description: "GitlabSigningOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { GitlabSigningOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                  | Presence | Meaning                                                                                                                                                                                                                                                                                                             |
| -------------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signingToken` | `TriggerSecret`       | Required | whsec_ signing token of the GitLab webhook (GitLab 19.0+) verifying webhook-signature, or a callback returning every currently accepted token (old and new during a rotation). An empty string throws at creation; a callback that fails or returns nothing, or a token without the whsec_ prefix, denies requests. |
| `toleranceMs`  | `number \| undefined` | Optional | Accepted clock difference for the request timestamp, in milliseconds; defaults to 300000 (5 minutes). A value that is not a positive integer throws at creation.                                                                                                                                                    |

## Signature

```ts
export interface GitlabSigningOptions {
  /** `whsec_` signing token verifying `webhook-signature` (GitLab 19.0+). */
  readonly signingToken: TriggerSecret;
  readonly toleranceMs?: number;
}
```

## Related contracts

- [TriggerSecret](../triggersecret/)
