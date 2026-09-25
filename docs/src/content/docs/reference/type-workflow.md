---
title: "Workflow"
description: "Workflow — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Workflow } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                     | Presence | Meaning                                                                                                   |
| --------- | -------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `name`    | `string`                                                 | Required | Name of the workflow definition, included in its execution reports.                                       |
| `tasks`   | `readonly Task<unknown>[]`                               | Required | Task definitions making up the graph, including every declared dependency.                                |
| `start`   | `(options?: WorkflowOptions) => Promise<WorkflowResult>` | Required | Execute the validated graph with the supplied concurrency, cancellation, budgets and checkpoint settings. |
| `diagram` | `() => string`                                           | Required | Return a Mermaid diagram of task keys and dependency edges without executing tasks.                       |

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

- [Task](../type-task/)
- [WorkflowOptions](../workflowoptions/)
- [WorkflowResult](../workflowresult/)
