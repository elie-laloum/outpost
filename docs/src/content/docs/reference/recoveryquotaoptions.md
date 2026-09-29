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

| Name           | Type                     | Presence | Meaning                                                                                                                                                                                   |
| -------------- | ------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter`  | `Transport \| undefined` | Optional | Measure the sizes of this transport's objects instead of the repository's .outpost files. An object outside the known categories makes the inventory incomplete.                          |
| `repository`   | `string \| undefined`    | Optional | Git checkout whose .outpost is measured, default process.cwd(), resolved to its top-level directory; a missing directory rejects with code workspace. Ignored with transporter.           |
| `maxBytes`     | `number`                 | Required | Limit for observed usage plus reserveBytes, in bytes; above it the call rejects with code workspace. Active reservations are not counted. Must be a non-negative safe integer.            |
| `reserveBytes` | `number \| undefined`    | Optional | Bytes added to observed usage for this check, default 0. Nothing is reserved.                                                                                                             |
| `maxEntries`   | `number \| undefined`    | Optional | Maximum files and directories scanned under .outpost, or objects listed from transporter, default 100000. Exceeding it makes the inventory incomplete, which rejects with code workspace. |

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
