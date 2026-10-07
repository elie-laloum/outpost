---
title: "RunObserverOptions"
description: "RunObserverOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunObserverOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                       | Presence | Meaning                                                                                                                    |
| ---------------- | -------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `transporter`    | `Transport`                | Required | Transport owning run snapshots and immutable event segments; caller owns its credentials and lifecycle.                    |
| `id`             | `string`                   | Required | Unique ID of at most 128 characters in one safe transport key segment.                                                     |
| `kind`           | `"workflow" \| "dispatch"` | Required | Choose dispatch for one request or workflow for one task graph.                                                            |
| `heartbeatMs`    | `number \| undefined`      | Optional | Heartbeat period in milliseconds, default 5000; positive and less than abandonAfterMs.                                     |
| `abandonAfterMs` | `number \| undefined`      | Optional | Suspected abandonment delay in milliseconds, default 30000, strictly greater than heartbeatMs.                             |
| `resume`         | `boolean \| undefined`     | Optional | Explicitly append to a settled workflow record with a fresh hub; duplicate creation and unsettled takeover remain refused. |

## Signature

```ts
export interface RunObserverOptions {
  readonly transporter: Transport;
  readonly id: string;
  readonly kind: "dispatch" | "workflow";
  readonly heartbeatMs?: number;
  readonly abandonAfterMs?: number;
  readonly resume?: boolean;
}
```

## Related contracts

- [Transport](../transport/)
