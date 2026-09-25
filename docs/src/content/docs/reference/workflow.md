---
title: "workflow"
description: "workflow — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { workflow } from "@elie-laloum/outpost";
```

## Purpose and behavior

Validate a named task graph for duplicate keys, missing dependencies and cycles, then return a reusable workflow definition. start schedules the tasks with concurrency, cancellation and optional checkpoints; diagram renders the dependency graph as Mermaid.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name    | Type                       | Presence | Meaning                                                                    |
| ------- | -------------------------- | -------- | -------------------------------------------------------------------------- |
| `name`  | `string`                   | Required | Name of the workflow definition, included in its execution reports.        |
| `tasks` | `readonly Task<unknown>[]` | Required | Task definitions making up the graph, including every declared dependency. |

## Returns

`Workflow`

## Signature

```ts
export declare function workflow(
  name: string,
  tasks: readonly Task[],
): Workflow;
```

## Related contracts

- [Task](../type-task/)
- [Workflow](../type-workflow/)
