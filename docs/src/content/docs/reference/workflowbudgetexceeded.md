---
title: "WorkflowBudgetExceeded"
description: "WorkflowBudgetExceeded — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowBudgetExceeded**. See the [workflows guide](../../workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import { WorkflowBudgetExceeded } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare class WorkflowBudgetExceeded extends Error {
  readonly dimension: "attempts" | keyof Usage;
  readonly limit: number;
  readonly observed: number;
  constructor(
    dimension: "attempts" | keyof Usage,
    limit: number,
    observed: number,
  );
}
```

## Related contracts

- [Usage](../usage/)
