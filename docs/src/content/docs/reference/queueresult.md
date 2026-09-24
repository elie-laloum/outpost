---
title: "QueueResult"
description: "QueueResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueueResult**. See the [distributed execution guide](../../workflows/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueueResult } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface QueueResult {
  readonly value: WorkflowJson;
  readonly usage?: Usage;
  readonly error?: string;
}
```

## Related contracts

- [Usage](../usage/)
- [WorkflowJson](../workflowjson/)
