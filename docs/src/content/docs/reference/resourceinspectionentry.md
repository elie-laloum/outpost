---
title: "ResourceInspectionEntry"
description: "ResourceInspectionEntry — Outpost API"
sidebar:
  order: 10
---

Public contract for **ResourceInspectionEntry**. See the [resource activity guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { ResourceInspectionEntry } from "@elie-laloum/outpost";
```

## Purpose and behavior

Read locally recorded lease and operation activity.

Local observations do not enumerate remote accounts and are not an authoritative cloud inventory.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name        | Type                                  | Presence | Meaning                                                                 |
| ----------- | ------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `path`      | `string`                              | Required | See the linked contract and this family's rules for its interpretation. |
| `record`    | `ResourceActivityRecord \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `ownership` | `LockOwnership`                       | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface ResourceInspectionEntry {
  readonly path: string;
  readonly record?: ResourceActivityRecord;
  readonly ownership: LockOwnership;
}
```

## Related contracts

- [LockOwnership](../support-lockownership/)
- [ResourceActivityRecord](../resourceactivityrecord/)
