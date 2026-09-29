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

| Name          | Type                  | Presence | Meaning                                                                                                                                                                                                                                                                   |
| ------------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `secret`      | `TriggerSecret`       | Required | whsec_ secret verifying webhook-signature, or a callback returning every currently accepted secret (old and new during a rotation). An empty string throws at creation; a callback that fails or returns nothing, or a secret without the whsec_ prefix, denies requests. |
| `toleranceMs` | `number \| undefined` | Optional | Accepted clock difference for the request timestamp, in milliseconds; defaults to 300000 (5 minutes). A value that is not a positive integer throws at creation.                                                                                                          |
| `source`      | `string \| undefined` | Optional | Name reported in TriggerEvent.source; defaults to standard.                                                                                                                                                                                                               |

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
