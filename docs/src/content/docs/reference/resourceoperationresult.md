---
title: "ResourceOperationResult"
description: "ResourceOperationResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **ResourceOperationResult**. See the [resource activity guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { ResourceOperationResult } from "@elie-laloum/outpost";
```

## Purpose and behavior

Read locally recorded lease and operation activity.

Local observations do not enumerate remote accounts and are not an authoritative cloud inventory.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name         | Type                                                                                                                                          | Presence | Meaning                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `id`         | `string`                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation. |
| `finishedAt` | `string`                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation. |
| `outcome`    | `"completed" \| "failed"`                                                                                                                     | Required | See the linked contract and this family's rules for its interpretation. |
| `count`      | `number`                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation. |
| `kind`       | `"command" \| "dispatch" \| "attach" \| "diagnose" \| "invoke" \| "upload" \| "download" \| "manifest" \| "download-batch" \| "upload-batch"` | Required | See the linked contract and this family's rules for its interpretation. |
| `startedAt`  | `string`                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface ResourceOperationResult extends ResourceOperation {
  readonly id: string;
  readonly finishedAt: string;
  readonly outcome: "completed" | "failed";
}
```

## Related contracts

- [ResourceOperation](../resourceoperation/)
