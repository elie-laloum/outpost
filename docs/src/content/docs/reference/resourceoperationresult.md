---
title: "ResourceOperationResult"
description: "ResourceOperationResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ResourceOperationResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                                                                                                                                          | Presence | Meaning                                                                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`         | `string`                                                                                                                                      | Required | Random UUID of this operation.                                                                                                                       |
| `finishedAt` | `string`                                                                                                                                      | Required | ISO time the operation settled.                                                                                                                      |
| `outcome`    | `"failed" \| "completed"`                                                                                                                     | Required | completed when the action resolved, failed when it threw.                                                                                            |
| `count`      | `number`                                                                                                                                      | Required | Number of operations of this kind running concurrently. Always 1 in lastOperation and lastFailure.                                                   |
| `kind`       | `"command" \| "dispatch" \| "attach" \| "diagnose" \| "invoke" \| "upload" \| "download" \| "manifest" \| "download-batch" \| "upload-batch"` | Required | Operation category, such as dispatch, command, upload or download.                                                                                   |
| `startedAt`  | `string`                                                                                                                                      | Required | ISO start time. In a result, when this operation started; in operations, when the first operation of this kind started since the kind was last idle. |

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
