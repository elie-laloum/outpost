---
title: "SpeculationRecoveryOptions"
description: "SpeculationRecoveryOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Part of the experimental speculation API: this contract can still change. See [Competing candidates](../../guide/speculation/).
:::

## Import

```ts
import type { SpeculationRecoveryOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                 | Type        | Presence | Meaning                                                                                                                |
| -------------------- | ----------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `runId`              | `string`    | Required | Identifier of the abandoned race whose ownership is being released.                                                    |
| `revision`           | `string`    | Required | Exact current transport revision inspected by the operator; a mismatch rejects recovery and fences concurrent changes. |
| `coordinatorStopped` | `true`      | Required | Explicit confirmation that the old coordinator has stopped; a remote PID or elapsed time is insufficient evidence.     |
| `transporter`        | `Transport` | Required | Transport containing the abandoned speculation ownership envelope.                                                     |

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
