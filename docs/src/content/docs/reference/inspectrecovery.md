---
title: "inspectRecovery"
description: "inspectRecovery — Outpost API"
sidebar:
  order: 10
---

Public contract for **inspectRecovery**. See the [resource activity guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import { inspectRecovery } from "@elie-laloum/outpost";
```

## Purpose and behavior

Read locally recorded lease and operation activity.

Local observations do not enumerate remote accounts and are not an authoritative cloud inventory.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name                 | Type                                     | Presence | Meaning                                                                                  |
| -------------------- | ---------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`            | `RecoveryInspectionOptions \| undefined` | Optional | Configuration object. Its fields are described in the associated options contract below. |
| `options.repository` | `string \| undefined`                    | Optional | Target host Git checkout.                                                                |
| `options.maxEntries` | `number \| undefined`                    | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.git`        | `boolean \| undefined`                   | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.locks`      | `boolean \| undefined`                   | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.resources`  | `boolean \| undefined`                   | Optional | See the linked contract and this family's rules for its interpretation.                  |

## Returns

`Promise<RecoveryInspection>`

## Signature

```ts
export declare function inspectRecovery(
  options?: RecoveryInspectionOptions,
): Promise<RecoveryInspection>;
```

## Related contracts

- [RecoveryInspection](../recoveryinspection/)
- [RecoveryInspectionOptions](../recoveryinspectionoptions/)
