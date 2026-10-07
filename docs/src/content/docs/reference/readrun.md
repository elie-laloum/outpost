---
title: "readRun"
description: "readRun — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { readRun } from "@elie-laloum/outpost";
```

## Purpose and behavior

Read and validate one atomically published execution snapshot without an execution lock. Return undefined for a missing ID. Derive abandoned and complete false when a running heartbeat has expired, without persisting that status or changing resource ownership. Stored observations can lag or be lost; this is not a checkpoint.

[Complete example and detailed rules](../../guide/run-state/).

## Parameters and properties

| Name                  | Type                       | Presence | Meaning                                                                                      |
| --------------------- | -------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `options`             | `ReadRunOptions`           | Required | Transport and execution ID with optional cancellation and per-object byte bound.             |
| `options.transporter` | `Transport`                | Required | Transport targeting the same location as the execution receiver.                             |
| `options.id`          | `string`                   | Required | Application-selected run ID to read without taking execution ownership.                      |
| `options.signal`      | `AbortSignal \| undefined` | Optional | Cancel transport reads and watch polling only; never cancels the observed execution.         |
| `options.maxBytes`    | `number \| undefined`      | Optional | Per-object read limit in bytes, default 8388608; oversized snapshots or event segments fail. |

## Returns

`Promise<RunSnapshot | undefined>`

## Signature

```ts
export declare function readRun(
  options: ReadRunOptions,
): Promise<RunSnapshot | undefined>;
```

## Related contracts

- [ReadRunOptions](../readrunoptions/)
- [RunSnapshot](../runsnapshot/)
