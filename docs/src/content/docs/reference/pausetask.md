---
title: "pauseTask"
description: "pauseTask — Outpost API"
sidebar:
  order: 10
---

Public contract for **pauseTask**. See the [approval and pause gates guide](../../guide/advanced/approvals/) for behavior, defaults and examples.

## Import

```ts
import { pauseTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Persist a pending decision and block dependent work until a trusted caller submits it.

Actor names are trusted metadata, not authentication. Paused runs need no timer. Rejection is final for that run. Invalid decision batches fail before applying any decision.

[Complete example and detailed rules](../../guide/advanced/approvals/).

## Parameters and properties

| Name             | Type                                    | Presence | Meaning                                                                                  |
| ---------------- | --------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`        | `WorkflowGateOptions`                   | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.key`    | `string`                                | Required | Stable task or cache key within its owning contract.                                     |
| `options.after`  | `readonly Task<unknown>[] \| undefined` | Optional | Declared task dependencies whose values may be read.                                     |
| `options.prompt` | `string`                                | Required | Human-readable instruction presented at this boundary.                                   |
| `options.actors` | `readonly string[]`                     | Required | Trusted actor identifiers, not an authentication mechanism.                              |

## Returns

`Task<WorkflowDecisionRecord>`

## Signature

```ts
export declare function pauseTask(
  options: WorkflowGateOptions,
): Task<WorkflowDecisionRecord>;
```

## Related contracts

- [Task](../task/)
- [WorkflowDecisionRecord](../workflowdecisionrecord/)
- [WorkflowGateOptions](../workflowgateoptions/)
