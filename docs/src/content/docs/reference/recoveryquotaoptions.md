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

| Name           | Type                  | Presence | Meaning                                                                       |
| -------------- | --------------------- | -------- | ----------------------------------------------------------------------------- |
| `repository`   | `string \| undefined` | Optional | Target host Git checkout.                                                     |
| `maxBytes`     | `number`              | Required | Maximum admitted total of observed storage and active reservations, in bytes. |
| `reserveBytes` | `number \| undefined` | Optional | Additional bytes requested for admission alongside existing storage usage.    |
| `maxEntries`   | `number \| undefined` | Optional | Maximum filesystem entries inspected before marking the inventory incomplete. |

## Signature

```ts
export interface RecoveryQuotaOptions {
  readonly repository?: string;
  readonly maxBytes: number;
  readonly reserveBytes?: number;
  readonly maxEntries?: number;
}
```
