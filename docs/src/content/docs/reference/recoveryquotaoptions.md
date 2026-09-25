---
title: "RecoveryQuotaOptions"
description: "RecoveryQuotaOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryQuotaOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                     | Presence | Meaning                                                                                                                                            |
| -------------- | ------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter`  | `Transport \| undefined` | Optional | Measure logical payload bytes in this object transport instead of the repository’s local runtime files. This is an observation, not a reservation. |
| `repository`   | `string \| undefined`    | Optional | Target host Git checkout.                                                                                                                          |
| `maxBytes`     | `number`                 | Required | Maximum admitted total of observed storage and active reservations, in bytes.                                                                      |
| `reserveBytes` | `number \| undefined`    | Optional | Additional bytes requested for admission alongside existing storage usage.                                                                         |
| `maxEntries`   | `number \| undefined`    | Optional | Maximum filesystem entries inspected before marking the inventory incomplete.                                                                      |

## Signature

```ts
export interface RecoveryQuotaOptions {
  readonly transporter?: Transport;
  readonly repository?: string;
  readonly maxBytes: number;
  readonly reserveBytes?: number;
  readonly maxEntries?: number;
}
```

## Related contracts

- [Transport](../transport/)
