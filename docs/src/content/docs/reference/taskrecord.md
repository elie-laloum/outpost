---
title: "TaskRecord"
description: "TaskRecord — Outpost API"
sidebar:
  order: 10
---

Public contract for **TaskRecord**. See the [workflows guide](../../workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import type { TaskRecord } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface TaskRecord {
  readonly key: string;
  status: TaskStatus;
  attempts: number;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
}
```

## Related contracts

- [TaskStatus](../taskstatus/)
