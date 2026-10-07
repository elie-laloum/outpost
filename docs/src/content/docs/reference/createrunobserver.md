---
title: "createRunObserver"
description: "createRunObserver — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createRunObserver } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a transport-backed receiver for one dispatch or workflow under a caller-selected ID. Conditional writes reject duplicate IDs and fence stale writers. Periodic heartbeats stop on settlement, storage failure or close. Resume appends only to settled workflow projections with a fresh hub; unsettled records require a new ID after explicit execution recovery. Observation failures remain isolated from execution.

[Complete example and detailed rules](../../guide/run-state/).

## Parameters and properties

| Name                     | Type                       | Presence | Meaning                                                                                                                    |
| ------------------------ | -------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `options`                | `RunObserverOptions`       | Required | Transport, execution ID, projection kind, heartbeat policy and optional settled-workflow resume.                           |
| `options.transporter`    | `Transport`                | Required | Transport owning run snapshots and immutable event segments; caller owns its credentials and lifecycle.                    |
| `options.id`             | `string`                   | Required | Unique ID of at most 128 characters in one safe transport key segment.                                                     |
| `options.kind`           | `"workflow" \| "dispatch"` | Required | Choose dispatch for one request or workflow for one task graph.                                                            |
| `options.heartbeatMs`    | `number \| undefined`      | Optional | Heartbeat period in milliseconds, default 5000; positive and less than abandonAfterMs.                                     |
| `options.abandonAfterMs` | `number \| undefined`      | Optional | Suspected abandonment delay in milliseconds, default 30000, strictly greater than heartbeatMs.                             |
| `options.resume`         | `boolean \| undefined`     | Optional | Explicitly append to a settled workflow record with a fresh hub; duplicate creation and unsettled takeover remain refused. |

## Returns

`Promise<RunObserver>`

## Signature

```ts
export declare function createRunObserver(
  options: RunObserverOptions,
): Promise<RunObserver>;
```

## Related contracts

- [RunObserver](../runobserver/)
- [RunObserverOptions](../runobserveroptions/)
