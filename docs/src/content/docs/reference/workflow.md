---
title: "Workflow"
description: "Workflow — Outpost API"
sidebar:
  order: 10
---

Public contract for **Workflow**. See the [workflows guide](../../guide/workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import type { Workflow } from "@elie-laloum/outpost";
```

## Purpose and behavior

Compose tasks with explicit dependency edges and typed result access.

Duplicate keys, missing dependencies and cycles fail validation. Failed or skipped dependencies skip descendants. Retries can repeat external effects. Unwrap throws on a non-successful result.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name      | Type                                                     | Presence | Meaning                                                                 |
| --------- | -------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `name`    | `string`                                                 | Required | See the linked contract and this family's rules for its interpretation. |
| `tasks`   | `readonly Task<unknown>[]`                               | Required | See the linked contract and this family's rules for its interpretation. |
| `start`   | `(options?: WorkflowOptions) => Promise<WorkflowResult>` | Required | See the linked contract and this family's rules for its interpretation. |
| `diagram` | `() => string`                                           | Required | See the linked contract and this family's rules for its interpretation. |

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
