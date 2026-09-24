---
title: "QueueRequest"
description: "QueueRequest — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueueRequest**. See the [distributed execution guide](../../workflows/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueueRequest } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface QueueRequest {
  readonly id: string;
  readonly handler: string;
  readonly input: WorkflowJson;
  readonly deadline?: number;
}
```

## Related contracts

- [WorkflowJson](../workflowjson/)
