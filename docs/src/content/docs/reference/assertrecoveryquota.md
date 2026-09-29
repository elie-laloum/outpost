---
title: "assertRecoveryQuota"
description: "assertRecoveryQuota — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { assertRecoveryQuota } from "@elie-laloum/outpost";
```

## Purpose and behavior

Resolve when observed storage plus reserveBytes stays at or below maxBytes. Otherwise, or when the inventory is incomplete, reject with code workspace and usageBytes, reserveBytes, maxBytes and complete in details. Nothing is reserved and active reservations are not counted; reserveRecoveryStorage() coordinates writers.

[Complete example and detailed rules](../../guide/retention/).

## Parameters and properties

| Name                   | Type                     | Presence | Meaning                                                                                                                                                                                   |
| ---------------------- | ------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`              | `RecoveryQuotaOptions`   | Required | Repository or transporter to measure, byte limit, extra bytes and scan limit.                                                                                                             |
| `options.transporter`  | `Transport \| undefined` | Optional | Measure the sizes of this transport's objects instead of the repository's .outpost files. An object outside the known categories makes the inventory incomplete.                          |
| `options.repository`   | `string \| undefined`    | Optional | Git checkout whose .outpost is measured, default process.cwd(), resolved to its top-level directory; a missing directory rejects with code workspace. Ignored with transporter.           |
| `options.maxBytes`     | `number`                 | Required | Limit for observed usage plus reserveBytes, in bytes; above it the call rejects with code workspace. Active reservations are not counted. Must be a non-negative safe integer.            |
| `options.reserveBytes` | `number \| undefined`    | Optional | Bytes added to observed usage for this check, default 0. Nothing is reserved.                                                                                                             |
| `options.maxEntries`   | `number \| undefined`    | Optional | Maximum files and directories scanned under .outpost, or objects listed from transporter, default 100000. Exceeding it makes the inventory incomplete, which rejects with code workspace. |

## Returns

`Promise<void>`

## Signature

```ts
export declare function assertRecoveryQuota(
  options: RecoveryQuotaOptions,
): Promise<void>;
```

## Related contracts

- [RecoveryQuotaOptions](../recoveryquotaoptions/)
