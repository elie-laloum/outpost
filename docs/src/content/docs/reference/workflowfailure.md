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

Error thrown by WorkflowResult.unwrap() when status is not done. result holds the whole WorkflowResult, code is its terminationCode and cause is its first error. A rejected gate therefore exposes code rejected; a suspended run has no code.

[Complete example and detailed rules](../../guide/task-dependencies/).

## Parameters and properties

| Name      | Type                                   | Presence | Meaning                                                                                                                                          |
| --------- | -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `code`    | `WorkflowTerminationCode \| undefined` | Required | The result’s terminationCode, available when unwrap() throws for failed, cancelled or rejected runs; undefined for paused or waiting-input runs. |
| `result`  | `WorkflowResult`                       | Required | The unsuccessful WorkflowResult, with its task records, errors and usage.                                                                        |
| `name`    | `string`                               | Required | Error class name used to distinguish this failure from other JavaScript errors.                                                                  |
| `message` | `string`                               | Required | Human-readable explanation of the failure.                                                                                                       |
| `stack`   | `string \| undefined`                  | Optional | JavaScript stack trace for the error, when available.                                                                                            |
| `cause`   | `unknown`                              | Optional | Underlying failure this error wraps; quotaFault() and unavailableFault() follow this chain.                                                      |

## Signature

```ts
export declare class WorkflowFailure extends Error {
  readonly code: WorkflowTerminationCode | undefined;
  readonly result: WorkflowResult;
  constructor(result: WorkflowResult);
}
```

## Related contracts

- [WorkflowResult](../workflowresult/)
- [WorkflowTerminationCode](../workflowterminationcode/)
