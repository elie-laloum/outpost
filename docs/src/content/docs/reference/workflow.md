---
title: "Workflow"
description: "Workflow — Outpost API"
sidebar:
  order: 10
---

Public contract for **Workflow**. See the [workflows guide](../../workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import type { Workflow } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface Workflow {
  readonly name: string;
  readonly tasks: readonly Task[];
  start(options?: WorkflowOptions): Promise<WorkflowResult>;
  diagram(): string;
}
```

## Related contracts

- [Task](../task/)
- [WorkflowOptions](../workflowoptions/)
- [WorkflowResult](../workflowresult/)
