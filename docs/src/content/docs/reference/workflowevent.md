---
title: "WorkflowEvent"
description: "WorkflowEvent — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowEvent**. See the [workflows guide](../../workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowEvent } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowEvent {
  readonly executionId: string;
  readonly workflow: string;
  readonly timestamp: string;
  readonly type: "start" | "task" | "attempt" | "retry" | "usage" | "finish";
  readonly key?: string;
  readonly status?: TaskStatus;
  readonly attempt?: number;
  readonly usage?: Usage;
  readonly durationMs?: number;
}
```

## Related contracts

- [TaskStatus](../taskstatus/)
- [Usage](../usage/)
