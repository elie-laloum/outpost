---
title: "approvalTask"
description: "approvalTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { approvalTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define a checkpoint-backed approval gate that pauses once its dependencies finish. A trusted listed actor must submit approve or reject with a reason. Approval yields the persisted decision to dependent tasks; rejection is final for that run.

[Complete example and detailed rules](../../guide/advanced/approvals/).

## Parameters and properties

| Name             | Type                                    | Presence | Meaning                                                                                                   |
| ---------------- | --------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `options`        | `WorkflowGateOptions`                   | Required | Gate key, dependencies, approval prompt and trusted actors allowed to approve or reject.                  |
| `options.key`    | `string`                                | Required | Stable task key identifying the node within its workflow graph.                                           |
| `options.after`  | `readonly Task<unknown>[] \| undefined` | Optional | Declared task dependencies whose values may be read.                                                      |
| `options.prompt` | `string`                                | Required | Instruction explaining the approval or pause decision requested from the trusted actor.                   |
| `options.actors` | `readonly string[]`                     | Required | Nonempty list of trusted actor names allowed to decide this gate; callers authenticate actors externally. |

## Returns

`Task<WorkflowDecisionRecord>`

## Signature

```ts
export declare function approvalTask(
  options: WorkflowGateOptions,
): Task<WorkflowDecisionRecord>;
```

## Related contracts

- [Task](../type-task/)
- [WorkflowDecisionRecord](../workflowdecisionrecord/)
- [WorkflowGateOptions](../workflowgateoptions/)
