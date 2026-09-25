---
title: "ResourceInspection"
description: "ResourceInspection — Outpost API"
sidebar:
  order: 10
---

Public contract for **ResourceInspection**. See the [resource activity guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { ResourceInspection } from "@elie-laloum/outpost";
```

## Purpose and behavior

Read locally recorded lease and operation activity.

Local observations do not enumerate remote accounts and are not an authoritative cloud inventory.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name       | Type                                 | Presence | Meaning                                                                 |
| ---------- | ------------------------------------ | -------- | ----------------------------------------------------------------------- |
| `scope`    | `"recorded-sandboxes"`               | Required | See the linked contract and this family's rules for its interpretation. |
| `complete` | `boolean`                            | Required | See the linked contract and this family's rules for its interpretation. |
| `entries`  | `readonly ResourceInspectionEntry[]` | Required | See the linked contract and this family's rules for its interpretation. |
| `issues`   | `readonly StorageIssue[]`            | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface ResourceInspection {
  readonly scope: "recorded-sandboxes";
  readonly complete: boolean;
  readonly entries: readonly ResourceInspectionEntry[];
  readonly issues: readonly StorageIssue[];
}
```

## Related contracts

- [ResourceInspectionEntry](../resourceinspectionentry/)
- [StorageIssue](../support-storageissue/)
