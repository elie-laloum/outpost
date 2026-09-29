---
title: "ResourceOperation"
description: "ResourceOperation — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ResourceOperation } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                                                                                                                          | Presence | Meaning                                                                                                                                              |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `count`     | `number`                                                                                                                                      | Required | Number of operations of this kind running concurrently. Always 1 in lastOperation and lastFailure.                                                   |
| `kind`      | `"command" \| "dispatch" \| "attach" \| "diagnose" \| "invoke" \| "upload" \| "download" \| "manifest" \| "download-batch" \| "upload-batch"` | Required | Operation category, such as dispatch, command, upload or download.                                                                                   |
| `startedAt` | `string`                                                                                                                                      | Required | ISO start time. In a result, when this operation started; in operations, when the first operation of this kind started since the kind was last idle. |

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
