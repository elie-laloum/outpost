---
title: "QuotaFault"
description: "QuotaFault — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QuotaFault } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                  | Presence | Meaning                                                                                   |
| --------- | --------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `message` | `string`              | Required | Message of the quota error, suitable for logs and pause records.                          |
| `resetAt` | `string \| undefined` | Optional | Valid ISO reset timestamp carried by the error details; absent when unknown or malformed. |

## Signature

```ts
export interface QuotaFault {
  readonly message: string;
  /** ISO timestamp when the provider reported that the limit resets. */
  readonly resetAt?: string;
}
```
