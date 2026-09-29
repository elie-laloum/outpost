---
title: "defineWorkflow"
description: "defineWorkflow — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineWorkflow } from "@elie-laloum/outpost";
```

## Purpose and behavior

Validate a named task graph for duplicate keys, missing dependencies and cycles, then return a reusable workflow definition. start schedules the tasks with concurrency, cancellation and optional checkpoints; diagram renders the dependency graph as Mermaid.

[Complete example and detailed rules](../../guide/task-dependencies/).

## Parameters and properties

| Name    | Type                       | Presence | Meaning                                                                    |
| ------- | -------------------------- | -------- | -------------------------------------------------------------------------- |
| `name`  | `string`                   | Required | Name of the workflow definition, included in its execution reports.        |
| `tasks` | `readonly Task<unknown>[]` | Required | Task definitions making up the graph, including every declared dependency. |

## Returns

`Workflow`

## Signature

```ts
export declare function defineWorkflow(
  name: string,
  tasks: readonly Task[],
): Workflow;
```

## Related contracts

- [Task](../type-task/)
- [Workflow](../type-workflow/)
