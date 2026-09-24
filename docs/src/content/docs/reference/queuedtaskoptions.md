---
title: "QueuedTaskOptions"
description: "QueuedTaskOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueuedTaskOptions**. See the [distributed execution guide](../../workflows/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueuedTaskOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export type QueuedTaskOptions<T> = Omit<TaskOptions<T>, "perform"> & {
  readonly queue: TaskQueue;
  readonly handler: string;
  readonly input: (context: TaskContext) => WorkflowJson;
  readonly decode: (value: WorkflowJson) => T;
  readonly deadline?: number;
  readonly pollMs?: number;
};
```

## Related contracts

- [TaskContext](../taskcontext/)
- [TaskOptions](../taskoptions/)
- [TaskQueue](../taskqueue/)
- [WorkflowJson](../workflowjson/)
