---
title: "WorkflowFailure"
description: "WorkflowFailure — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { WorkflowFailure } from "@elie-laloum/outpost";
```

## Purpose and behavior

Error thrown by WorkflowResult.unwrap when the run did not finish successfully. Its result preserves task records, errors and usage for inspection rather than discarding the workflow outcome.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name      | Type                  | Presence | Meaning                                                                              |
| --------- | --------------------- | -------- | ------------------------------------------------------------------------------------ |
| `result`  | `WorkflowResult`      | Required | Complete unsuccessful workflow result retained for task, error and usage inspection. |
| `name`    | `string`              | Required | Error class name used to distinguish this failure from other JavaScript errors.      |
| `message` | `string`              | Required | Human-readable explanation of the failure.                                           |
| `stack`   | `string \| undefined` | Optional | JavaScript stack trace for the error, when available.                                |
| `cause`   | `unknown`             | Optional | Original failure attached to this error.                                             |

## Signature

```ts
export declare class WorkflowFailure extends Error {
  readonly result: WorkflowResult;
  constructor(result: WorkflowResult);
}
```

## Related contracts

- [WorkflowResult](../workflowresult/)
