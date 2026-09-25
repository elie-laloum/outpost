---
title: "assertRecoveryQuota"
description: "assertRecoveryQuota — Outpost API"
sidebar:
  order: 10
---

Public contract for **assertRecoveryQuota**. See the [recovery and retention guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import { assertRecoveryQuota } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name                   | Type                   | Presence | Meaning                                                                                  |
| ---------------------- | ---------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`              | `RecoveryQuotaOptions` | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.repository`   | `string \| undefined`  | Optional | Target host Git checkout.                                                                |
| `options.maxBytes`     | `number`               | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.reserveBytes` | `number \| undefined`  | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.maxEntries`   | `number \| undefined`  | Optional | See the linked contract and this family's rules for its interpretation.                  |

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
