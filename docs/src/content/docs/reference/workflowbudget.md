---
title: "WorkflowBudget"
description: "WorkflowBudget — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowBudget**. See the [workflows guide](../../workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowBudget } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowBudget {
  readonly attempts?: number;
  readonly usage?: Partial<Usage>;
}
```

## Related contracts

- [Usage](../usage/)
