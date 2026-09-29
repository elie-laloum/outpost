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

| Name           | Type                  | Presence | Meaning                                                                                                                                                                                                                                         |
| -------------- | --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signingToken` | `TriggerSecret`       | Required | whsec_ signing token of the GitLab webhook (GitLab 19.0+), verifying webhook-signature. Secret, or callback returning every currently accepted secret; return old and new values during a rotation. An empty or failing source denies requests. |
| `toleranceMs`  | `number \| undefined` | Optional | Accepted clock difference for the request timestamp, in milliseconds; defaults to 300000 (5 minutes).                                                                                                                                           |

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
