---
title: "WorkflowResult"
description: "WorkflowResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowResult**. See the [workflows guide](../../workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowResult } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowResult {
  readonly executionId: string;
  readonly name: string;
  readonly status: "done" | "failed" | "cancelled" | "paused";
  readonly tasks: readonly Readonly<TaskRecord>[];
  readonly errors: readonly unknown[];
  readonly observerErrors: readonly unknown[];
  readonly usage: WorkflowUsage;
  value<T>(task: Task<T>): T;
  unwrap(): void;
}
```

## Related contracts

- [Task](../task/)
- [TaskRecord](../taskrecord/)
- [WorkflowUsage](../workflowusage/)
