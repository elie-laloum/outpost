---
title: "pauseTask"
description: "pauseTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { pauseTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define a checkpoint-backed pause that waits for an explicit resume or reject decision from a listed trusted actor. It uses no waiting timer and can survive process restarts; unlike approvalTask, its successful decision action is resume.

[Complete example and detailed rules](../../guide/advanced/approvals/).

## Parameters and properties

| Name             | Type                                    | Presence | Meaning                                                                                                   |
| ---------------- | --------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `options`        | `WorkflowGateOptions`                   | Required | Gate key, dependencies, pause prompt and trusted actors allowed to resume or reject.                      |
| `options.key`    | `string`                                | Required | Stable task key identifying the node within its workflow graph.                                           |
| `options.after`  | `readonly Task<unknown>[] \| undefined` | Optional | Declared task dependencies whose values may be read.                                                      |
| `options.prompt` | `string`                                | Required | Instruction explaining the approval or pause decision requested from the trusted actor.                   |
| `options.actors` | `readonly string[]`                     | Required | Nonempty list of trusted actor names allowed to decide this gate; callers authenticate actors externally. |

## Returns

`Task<WorkflowDecisionRecord>`

## Signature

```ts
export declare function pauseTask(
  options: WorkflowGateOptions,
): Task<WorkflowDecisionRecord>;
```

## Related contracts

- [Task](../type-task/)
- [WorkflowDecisionRecord](../workflowdecisionrecord/)
- [WorkflowGateOptions](../workflowgateoptions/)
