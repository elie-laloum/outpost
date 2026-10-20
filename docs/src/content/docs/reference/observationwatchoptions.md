---
title: "ObservationWatchOptions"
description: "ObservationWatchOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ObservationWatchOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                       | Presence | Meaning                                                                                         |
| ---------- | -------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `signal`   | `AbortSignal \| undefined` | Optional | Cancel transport reads and watch polling only; never cancels the observed execution.            |
| `maxBytes` | `number \| undefined`      | Optional | Per-object read limit in bytes, default 8388608; oversized snapshots or event segments fail.    |
| `from`     | `number \| undefined`      | Optional | Exclusive persistent cursor, default 0; negative, fractional or ahead-of-snapshot cursors fail. |
| `pollMs`   | `number \| undefined`      | Optional | Positive polling period in milliseconds while running, default 1000.                            |

## Signature

```ts
export interface ObservationWatchOptions extends Omit<
  WatchRunOptions,
  "transporter" | "id"
> {}
```

## Related contracts

- [WatchRunOptions](../watchrunoptions/)
