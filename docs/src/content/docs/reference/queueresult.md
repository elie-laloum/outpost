---
title: "QueueResult"
description: "QueueResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type                      | Presence | Meaning                                                                                                                    |
| ------- | ------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `value` | `WorkflowJson`            | Required | JSON value produced by the handler, at most 262144 bytes serialized; runQueueWorker() stores null when the handler throws. |
| `usage` | `Usage \| undefined`      | Optional | Token counters (input, output, cached, cacheCreated) that defineQueuedTask() adds to the workflow’s usage.                 |
| `error` | `string \| undefined`     | Optional | Failure message, at most 512 characters; its presence marks the job failed. runQueueWorker() fills it from a thrown error. |
| `quota` | `QueueQuota \| undefined` | Optional | Usage or rate limit that failed the handler, with its reset time and captured conversation when known; requires error.     |

## Signature

```ts
export interface QueueResult {
  readonly value: WorkflowJson;
  readonly usage?: Usage;
  readonly error?: string;
  /** Present when the handler failed on a usage or rate limit. */
  readonly quota?: QueueQuota;
}
```

## Related contracts

- [QueueQuota](../queuequota/)
- [Usage](../usage/)
- [WorkflowJson](../workflowjson/)
