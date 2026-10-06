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

Define a gate task that holds the run once its dependencies are done until a listed actor submits resume or reject. It takes the same options and validation as defineApprovalTask(); resume makes the WorkflowDecisionRecord the gate's value. Reject has the same rejected termination semantics as an approval gate.

[Complete example and detailed rules](../../guide/approvals/).

## Parameters and properties

| Name                     | Type                                    | Presence | Meaning                                                                                                                                                |
| ------------------------ | --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                | `WorkflowGateOptions`                   | Required | Gate key, dependencies, prompt, actors allowed to resume or reject, and the optional signed authentication.                                            |
| `options.authentication` | `"signed" \| undefined`                 | Optional | Set to signed to require a verified Ed25519 proof on every decision for this gate. Stored in the gate and in checkpoint identity.                      |
| `options.key`            | `string`                                | Required | Task key of the gate, unique in the workflow and named by each decision. Letters, digits, dot, underscore and hyphen, starting with a letter or digit. |
| `options.after`          | `readonly Task<unknown>[] \| undefined` | Optional | Tasks that must be done before the gate pauses. If one fails or is skipped, cancelled or rejected, the gate is skipped.                                |
| `options.prompt`         | `string`                                | Required | Question put to the actors, copied into the pending request. A blank prompt throws.                                                                    |
| `options.actors`         | `readonly string[]`                     | Required | Names allowed to decide the gate: at least one, unique and nonblank. Outpost trusts the actor your application submits unless the gate is signed.      |

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
