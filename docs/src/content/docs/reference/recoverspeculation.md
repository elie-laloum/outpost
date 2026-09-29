---
title: "recoverSpeculation"
description: "recoverSpeculation — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { recoverSpeculation } from "@elie-laloum/outpost";
```

## Purpose and behavior

Release abandoned speculation ownership using an inspected transport revision after the previous coordinator has stopped. This fences stale writes; the next speculate call reconciles registered resources and requires explicit authorization before replaying incomplete candidates.

[Complete example and detailed rules](../../guide/speculation/).

## Parameters and properties

| Name                         | Type                         | Presence | Meaning                                                                                                                    |
| ---------------------------- | ---------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `options`                    | `SpeculationRecoveryOptions` | Required | Abandoned race identity, inspected revision and explicit confirmation that its coordinator has stopped.                    |
| `options.runId`              | `string`                     | Required | Identifier of the abandoned race whose ownership is being released.                                                        |
| `options.revision`           | `string`                     | Required | Exact current transport revision inspected by the operator; a mismatch rejects recovery and fences concurrent changes.     |
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
