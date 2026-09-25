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

| Name        | Type                                                                                                                                          | Presence | Meaning                                                         |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------- |
| `count`     | `number`                                                                                                                                      | Required | Monotonically increasing local operation sequence number.       |
| `kind`      | `"command" \| "dispatch" \| "attach" \| "diagnose" \| "invoke" \| "upload" \| "download" \| "manifest" \| "download-batch" \| "upload-batch"` | Required | Operation category recorded for sandbox activity tracking.      |
| `startedAt` | `string`                                                                                                                                      | Required | ISO timestamp when execution of this task or operation started. |

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
