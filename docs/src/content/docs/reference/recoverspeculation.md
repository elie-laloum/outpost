---
title: "recoverSpeculation"
description: "recoverSpeculation — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Speculation is experimental: its options and result can still change. See [Competing candidates](../../guide/speculation/).
:::

## Import

```ts
import { recoverSpeculation } from "@elie-laloum/outpost";
```

## Purpose and behavior

Release the ownership of a durable race whose coordinator has stopped, provided its saved object is still at the given revision; otherwise rejects with TransportConflict. It stops and deletes nothing: the next speculate() call stops registered resources and needs resume: retry-incomplete to replay interrupted candidates.

[Complete example and detailed rules](../../guide/resuming-speculation/).

## Parameters and properties

| Name                         | Type                         | Presence | Meaning                                                                                                                    |
| ---------------------------- | ---------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `options`                    | `SpeculationRecoveryOptions` | Required | Abandoned race identity, inspected revision and explicit confirmation that its coordinator has stopped.                    |
| `options.runId`              | `string`                     | Required | runId of the race to release.                                                                                              |
| `options.revision`           | `string`                     | Required | Revision of the saved object as you read it; if it changed since, recovery rejects with TransportConflict.                 |
| `options.coordinatorStopped` | `true`                       | Required | Explicit confirmation that the old coordinator has stopped; a remote PID or elapsed time is insufficient evidence.         |
| `options.transporter`        | `Transport`                  | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |

## Returns

`Promise<void>`

## Signature

```ts
export declare function recoverSpeculation(
  options: SpeculationRecoveryOptions,
): Promise<void>;
```

## Related contracts

- [SpeculationRecoveryOptions](../speculationrecoveryoptions/)
