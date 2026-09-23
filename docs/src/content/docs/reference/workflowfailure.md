---
title: "WorkflowFailure"
description: "WorkflowFailure — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowFailure**. See the [workflows guide](../../workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import { WorkflowFailure } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare class WorkflowFailure extends Error {
  readonly result: WorkflowResult;
  constructor(result: WorkflowResult);
}
```

## Related contracts

- [WorkflowResult](../workflowresult/)
