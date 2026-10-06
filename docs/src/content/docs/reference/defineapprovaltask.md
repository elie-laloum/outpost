---
title: "defineApprovalTask"
description: "defineApprovalTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineApprovalTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define a gate task that pauses the run once its dependencies are done and waits for approve or reject from a listed actor. Approve makes the WorkflowDecisionRecord the gate's value; reject skips dependent tasks and ends the run with status and terminationCode rejected, unless an independent technical failure or external cancellation takes precedence. Throws on a blank prompt or on empty, blank or duplicate actors; scheduling it without a checkpoint throws.

[Complete example and detailed rules](../../guide/approvals/).

## Parameters and properties

| Name                     | Type                                    | Presence | Meaning                                                                                                                                                |
| ------------------------ | --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                | `WorkflowGateOptions`                   | Required | Gate key, dependencies, prompt, actors allowed to approve or reject, and the optional signed authentication.                                           |
| `options.authentication` | `"signed" \| undefined`                 | Optional | Set to signed to require a verified Ed25519 proof on every decision for this gate. Stored in the gate and in checkpoint identity.                      |
| `options.key`            | `string`                                | Required | Task key of the gate, unique in the workflow and named by each decision. Letters, digits, dot, underscore and hyphen, starting with a letter or digit. |
| `options.after`          | `readonly Task<unknown>[] \| undefined` | Optional | Tasks that must be done before the gate pauses. If one fails or is skipped, cancelled or rejected, the gate is skipped.                                |
| `options.prompt`         | `string`                                | Required | Question put to the actors, copied into the pending request. A blank prompt throws.                                                                    |
| `options.actors`         | `readonly string[]`                     | Required | Names allowed to decide the gate: at least one, unique and nonblank. Outpost trusts the actor your application submits unless the gate is signed.      |

## Returns

`Task<WorkflowDecisionRecord>`

## Signature

```ts
export declare function defineApprovalTask(
  options: WorkflowGateOptions,
): Task<WorkflowDecisionRecord>;
```

## Related contracts

- [Task](../type-task/)
- [WorkflowDecisionRecord](../workflowdecisionrecord/)
- [WorkflowGateOptions](../workflowgateoptions/)
