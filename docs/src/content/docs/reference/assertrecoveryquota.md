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

Inspect recovery storage and reject if observed bytes plus the requested reservation exceed maxBytes, or if inspection cannot establish admission. This check does not reserve space or impose a filesystem quota; reserveRecoveryStorage coordinates cooperating writers.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name                   | Type                   | Presence | Meaning                                                                              |
| ---------------------- | ---------------------- | -------- | ------------------------------------------------------------------------------------ |
| `options`              | `RecoveryQuotaOptions` | Required | Repository, maximum admitted bytes, additional requested bytes and inspection bound. |
| `options.repository`   | `string \| undefined`  | Optional | Target host Git checkout.                                                            |
| `options.maxBytes`     | `number`               | Required | Maximum admitted total of observed storage and active reservations, in bytes.        |
| `options.reserveBytes` | `number \| undefined`  | Optional | Additional bytes requested for admission alongside existing storage usage.           |
| `options.maxEntries`   | `number \| undefined`  | Optional | Maximum filesystem entries inspected before marking the inventory incomplete.        |

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
