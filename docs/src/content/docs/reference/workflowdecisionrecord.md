---
title: "WorkflowDecisionRecord"
description: "WorkflowDecisionRecord — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowDecisionRecord**. See the [approval and pause gates guide](../../workflows/approvals/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowDecisionRecord } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowDecisionRecord extends WorkflowDecision {
  readonly decidedAt: string;
}
```

## Related contracts

- [WorkflowDecision](../workflowdecision/)
