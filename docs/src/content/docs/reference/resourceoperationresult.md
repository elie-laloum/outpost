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

| Name         | Type                                                                                                                                          | Presence | Meaning                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------- |
| `id`         | `string`                                                                                                                                      | Required | Recorded identifier of the completed resource operation.         |
| `finishedAt` | `string`                                                                                                                                      | Required | ISO timestamp when execution of this task or operation finished. |
| `outcome`    | `"failed" \| "completed"`                                                                                                                     | Required | Whether the recorded operation completed or failed.              |
| `count`      | `number`                                                                                                                                      | Required | Monotonically increasing local operation sequence number.        |
| `kind`       | `"command" \| "dispatch" \| "attach" \| "diagnose" \| "invoke" \| "upload" \| "download" \| "manifest" \| "download-batch" \| "upload-batch"` | Required | Operation category recorded for sandbox activity tracking.       |
| `startedAt`  | `string`                                                                                                                                      | Required | ISO timestamp when execution of this task or operation started.  |

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
