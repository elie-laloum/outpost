---
title: "TaskContext"
description: "TaskContext — Outpost API"
sidebar:
  order: 10
---

Public contract for **TaskContext**. See the [workflows guide](../../workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import type { TaskContext } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface TaskContext {
  readonly signal: AbortSignal;
  readonly attempt: number;
  readonly executionId: string;
  reportUsage(usage: Usage): void;
  value<T>(dependency: Task<T>): T;
}
```

## Related contracts

- [Task](../task/)
- [Usage](../usage/)
