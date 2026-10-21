---
title: "SpeculationRecoveryOptions"
description: "SpeculationRecoveryOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SpeculationRecoveryOptions } from "@elie-laloum/outpost/experimental/speculation";
```

## Parameters and properties

| Name                 | Type        | Presence | Meaning                                                                                                            |
| -------------------- | ----------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `runId`              | `string`    | Required | runId of the race to release.                                                                                      |
| `revision`           | `string`    | Required | Revision of the saved object as you read it; if it changed since, recovery rejects with TransportConflict.         |
| `coordinatorStopped` | `true`      | Required | Explicit confirmation that the old coordinator has stopped; a remote PID or elapsed time is insufficient evidence. |
| `transporter`        | `Transport` | Required | Transport holding the saved race.                                                                                  |

## Signature

```ts
export interface SpeculationRecoveryOptions extends TransportStoreOptions {
  readonly runId: string;
  readonly revision: string;
  readonly coordinatorStopped: true;
}
```

## Related contracts

- [TransportStoreOptions](../transportstoreoptions/)
