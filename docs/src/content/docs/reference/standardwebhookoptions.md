---
title: "StandardWebhookOptions"
description: "StandardWebhookOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StandardWebhookOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                  | Presence | Meaning                                                                                                                                                                                            |
| ------------- | --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `secret`      | `TriggerSecret`       | Required | whsec_ secret verifying webhook-signature. Secret, or callback returning every currently accepted secret; return old and new values during a rotation. An empty or failing source denies requests. |
| `toleranceMs` | `number \| undefined` | Optional | Accepted clock difference for the request timestamp, in milliseconds; defaults to 300000 (5 minutes).                                                                                              |
| `source`      | `string \| undefined` | Optional | Name reported in TriggerEvent.source; defaults to standard.                                                                                                                                        |

## Signature

```ts
export interface StandardWebhookOptions {
  /** `whsec_` secret verifying Standard Webhooks signatures. */
  readonly secret: TriggerSecret;
  readonly toleranceMs?: number;
  /** Event source name; defaults to `standard`. */
  readonly source?: string;
}
```

## Related contracts

- [TriggerSecret](../triggersecret/)
