---
title: "QueueJob"
description: "QueueJob — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueueJob**. See the [distributed execution guide](../../workflows/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueueJob } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface QueueJob extends QueueRequest {
  readonly status: "pending" | "active" | "done" | "failed" | "cancelled";
  readonly fence: number;
  readonly worker?: string;
  readonly expires?: number;
  readonly result?: QueueResult;
}
```

## Related contracts

- [QueueRequest](../queuerequest/)
- [QueueResult](../queueresult/)
