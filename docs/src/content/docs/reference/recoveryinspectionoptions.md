---
title: "RecoveryInspectionOptions"
description: "RecoveryInspectionOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryInspectionOptions**. See the [resource activity guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryInspectionOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Read locally recorded lease and operation activity.

Local observations do not enumerate remote accounts and are not an authoritative cloud inventory.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name         | Type                   | Presence | Meaning                                                                 |
| ------------ | ---------------------- | -------- | ----------------------------------------------------------------------- |
| `repository` | `string \| undefined`  | Optional | Target host Git checkout.                                               |
| `maxEntries` | `number \| undefined`  | Optional | See the linked contract and this family's rules for its interpretation. |
| `git`        | `boolean \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `locks`      | `boolean \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `resources`  | `boolean \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface RecoveryInspectionOptions {
  readonly repository?: string;
  readonly maxEntries?: number;
  readonly git?: boolean;
  readonly locks?: boolean;
  readonly resources?: boolean;
}
```
