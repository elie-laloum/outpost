---
title: "definePauseTask"
description: "definePauseTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { definePauseTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define a checkpoint-backed pause that waits for an explicit resume or reject decision from a listed trusted actor. It uses no waiting timer and can survive process restarts; unlike defineApprovalTask, its successful decision action is resume.

[Complete example and detailed rules](../../guide/advanced/approvals/).

## Parameters and properties

| Name                     | Type                                    | Presence | Meaning                                                                                                                                   |
| ------------------------ | --------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                | `WorkflowGateOptions`                   | Required | Gate key, dependencies, pause prompt and trusted actors allowed to resume or reject.                                                      |
| `options.authentication` | `"signed" \| undefined`                 | Optional | Require a verified proof for this approval or pause gate and persist that requirement in the graph identity.                              |
| `options.key`            | `string`                                | Required | Stable task key identifying the node within its workflow graph.                                                                           |
| `options.after`          | `readonly Task<unknown>[] \| undefined` | Optional | Declared task dependencies whose values may be read.                                                                                      |
| `options.prompt`         | `string`                                | Required | Instruction explaining the approval or pause decision requested from the trusted actor.                                                   |
| `options.actors`         | `readonly string[]`                     | Required | Nonempty, unique actor names permitted to decide the gate being created; signed authentication binds the selected actor to a trusted key. |

## Returns

`Task<WorkflowDecisionRecord>`

## Signature

```ts
export declare function definePauseTask(
  options: WorkflowGateOptions,
): Task<WorkflowDecisionRecord>;
```

## Related contracts

- [Task](../type-task/)
- [WorkflowDecisionRecord](../workflowdecisionrecord/)
- [WorkflowGateOptions](../workflowgateoptions/)
