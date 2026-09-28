---
title: "TaskCacheEntry"
description: "TaskCacheEntry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskCacheEntry } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                      | Presence | Meaning                                                                                                                             |
| ------------- | ------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `format`      | `1`                       | Required | Version of this serialized entry format; currently 1.                                                                               |
| `fingerprint` | `string`                  | Required | SHA-256 hex digest of the workflow name, task key, cache version and canonical key; entries whose fingerprint differs are rejected. |
| `workflow`    | `string`                  | Required | Name of the workflow that stored the entry.                                                                                         |
| `task`        | `string`                  | Required | Key of the task whose result the entry holds.                                                                                       |
| `version`     | `string`                  | Required | Cache version declared by the task when the entry was stored.                                                                       |
| `createdAt`   | `string`                  | Required | ISO timestamp when the result was stored; compared with maxAgeMs.                                                                   |
| `value`       | `WorkflowCheckpointValue` | Required | Stored task result: lossless JSON or top-level undefined.                                                                           |

## Signature

```ts
export interface TaskCacheEntry {
  readonly format: 1;
  readonly fingerprint: string;
  readonly workflow: string;
  readonly task: string;
  readonly version: string;
  readonly createdAt: string;
  readonly value: WorkflowCheckpointValue;
}
```

## Related contracts

- [WorkflowCheckpointValue](../workflowcheckpointvalue/)
