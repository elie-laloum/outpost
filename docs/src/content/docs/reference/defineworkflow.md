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

Validate a named task list and return a frozen Workflow whose start() runs the graph and diagram() draws it as Mermaid. Throws on an empty name, a duplicate key, a dependency missing from the list, a cycle, or a gate with a condition, retry, timeout or cache.

[Complete example and detailed rules](../../guide/task-dependencies/).

## Parameters and properties

| Name    | Type                       | Presence | Meaning                                                                       |
| ------- | -------------------------- | -------- | ----------------------------------------------------------------------------- |
| `name`  | `string`                   | Required | Workflow name, not empty; part of the checkpoint identity and of every event. |
| `tasks` | `readonly Task<unknown>[]` | Required | Every task of the graph; each dependency must also be in the list.            |

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
