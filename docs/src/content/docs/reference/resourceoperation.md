---
title: "ResourceOperation"
description: "ResourceOperation — Outpost API"
sidebar:
  order: 10
---

Public contract for **ResourceOperation**. See the [resource activity guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { ResourceOperation } from "@elie-laloum/outpost";
```

## Purpose and behavior

Read locally recorded lease and operation activity.

Local observations do not enumerate remote accounts and are not an authoritative cloud inventory.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name        | Type                                                                                                                                          | Presence | Meaning                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `count`     | `number`                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation. |
| `kind`      | `"command" \| "dispatch" \| "attach" \| "diagnose" \| "invoke" \| "upload" \| "download" \| "manifest" \| "download-batch" \| "upload-batch"` | Required | See the linked contract and this family's rules for its interpretation. |
| `startedAt` | `string`                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface ResourceOperation {
  readonly count: number;
  readonly kind: ResourceOperationKind;
  readonly startedAt: string;
}
```

## Related contracts

- [ResourceOperationKind](../resourceoperationkind/)
