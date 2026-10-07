---
title: "watchRun"
description: "watchRun — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { watchRun } from "@elie-laloum/outpost";
```

## Purpose and behavior

Replay published observation segments strictly after from, then poll while the snapshot is running. Stop after draining a settled or abandoned snapshot. Persistent cursors continue across settled workflow resumes; heartbeat writes do not advance them. Signal cancellation affects only this reader. Missing segments, invalid records and cursors ahead of the snapshot throw.

[Complete example and detailed rules](../../guide/run-state/).

## Parameters and properties

| Name                  | Type                       | Presence | Meaning                                                                                         |
| --------------------- | -------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `options`             | `WatchRunOptions`          | Required | Run lookup, exclusive cursor, polling interval and optional reader cancellation.                |
| `options.from`        | `number \| undefined`      | Optional | Exclusive persistent cursor, default 0; negative, fractional or ahead-of-snapshot cursors fail. |
| `options.pollMs`      | `number \| undefined`      | Optional | Positive polling period in milliseconds while running, default 1000.                            |
| `options.transporter` | `Transport`                | Required | Transport targeting the same location as the execution receiver.                                |
| `options.id`          | `string`                   | Required | Application-selected run ID to read without taking execution ownership.                         |
| `options.signal`      | `AbortSignal \| undefined` | Optional | Cancel transport reads and watch polling only; never cancels the observed execution.            |
| `options.maxBytes`    | `number \| undefined`      | Optional | Per-object read limit in bytes, default 8388608; oversized snapshots or event segments fail.    |

## Returns

`AsyncIterable<RunEvent>`

## Signature

```ts
export declare function watchRun(
  options: WatchRunOptions,
): AsyncIterable<RunEvent>;
```

## Related contracts

- [RunEvent](../runevent/)
- [WatchRunOptions](../watchrunoptions/)
