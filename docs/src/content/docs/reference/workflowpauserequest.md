---
title: "WorkflowPauseRequest"
description: "WorkflowPauseRequest — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowPauseRequest**. See the [approval and pause gates guide](../../workflows/approvals/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowPauseRequest } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowPauseRequest extends WorkflowGate {
  readonly id: string;
  readonly requestedAt: string;
}
```

## Related contracts

- [WorkflowGate](../workflowgate/)
