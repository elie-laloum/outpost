---
title: "RecoveryQuotaOptions"
description: "RecoveryQuotaOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryQuotaOptions**. See the [recovery and retention guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryQuotaOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name           | Type                  | Presence | Meaning                                                                 |
| -------------- | --------------------- | -------- | ----------------------------------------------------------------------- |
| `repository`   | `string \| undefined` | Optional | Target host Git checkout.                                               |
| `maxBytes`     | `number`              | Required | See the linked contract and this family's rules for its interpretation. |
| `reserveBytes` | `number \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `maxEntries`   | `number \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface RecoveryQuotaOptions {
  readonly repository?: string;
  readonly maxBytes: number;
  readonly reserveBytes?: number;
  readonly maxEntries?: number;
}
```
