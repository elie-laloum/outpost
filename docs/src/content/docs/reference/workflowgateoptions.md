---
title: "WorkflowGateOptions"
description: "WorkflowGateOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowGateOptions**. See the [approval and pause gates guide](../../workflows/approvals/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowGateOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowGateOptions {
  readonly key: string;
  readonly after?: readonly Task[];
  readonly prompt: string;
  readonly actors: readonly string[];
}
```

## Related contracts

- [Task](../task/)
