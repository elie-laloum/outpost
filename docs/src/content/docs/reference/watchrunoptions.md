---
title: "WatchRunOptions"
description: "WatchRunOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WatchRunOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                       | Presence | Meaning                                                                                         |
| ------------- | -------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `from`        | `number \| undefined`      | Optional | Exclusive persistent cursor, default 0; negative, fractional or ahead-of-snapshot cursors fail. |
| `pollMs`      | `number \| undefined`      | Optional | Positive polling period in milliseconds while running, default 1000.                            |
| `transporter` | `Transport`                | Required | Transport targeting the same location as the execution receiver.                                |
| `id`          | `string`                   | Required | Application-selected run ID to read without taking execution ownership.                         |
| `signal`      | `AbortSignal \| undefined` | Optional | Cancel transport reads and watch polling only; never cancels the observed execution.            |
| `maxBytes`    | `number \| undefined`      | Optional | Per-object read limit in bytes, default 8388608; oversized snapshots or event segments fail.    |

## Signature

```ts
export interface WatchRunOptions extends ReadRunOptions {
  readonly from?: number;
  readonly pollMs?: number;
}
```

## Related contracts

- [ReadRunOptions](../readrunoptions/)
