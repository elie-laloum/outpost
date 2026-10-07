---
title: "WorkflowBudgetExceeded"
description: "WorkflowBudgetExceeded — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { WorkflowBudgetExceeded } from "@elie-laloum/outpost";
```

## Purpose and behavior

Error recorded in WorkflowResult.errors when a budget limit is reached, which fails the run. An attempts limit cancels the tasks not yet started; a token limit also cancels running tasks.

[Complete example and detailed rules](../../guide/budgets/).

## Parameters and properties

| Name        | Type                                                                        | Presence | Meaning                                                                                     |
| ----------- | --------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `dimension` | `"input" \| "cached" \| "cacheCreated" \| "output" \| "attempts" \| "cost"` | Required | Budget dimension whose admission limit was exceeded: attempts or a token counter.           |
| `limit`     | `number`                                                                    | Required | Configured admission threshold for the exceeded budget dimension.                           |
| `observed`  | `number`                                                                    | Required | Current cumulative amount observed for the exceeded budget dimension.                       |
| `name`      | `string`                                                                    | Required | Error class name used to distinguish this failure from other JavaScript errors.             |
| `message`   | `string`                                                                    | Required | Human-readable explanation of the failure.                                                  |
| `stack`     | `string \| undefined`                                                       | Optional | JavaScript stack trace for the error, when available.                                       |
| `cause`     | `unknown`                                                                   | Optional | Underlying failure this error wraps; quotaFault() and unavailableFault() follow this chain. |

## Signature

```ts
export declare class WorkflowBudgetExceeded extends Error {
  readonly dimension:
    "attempts" | "cost" | Exclude<keyof Usage, "complete" | "models">;
  readonly limit: number;
  readonly observed: number;
  constructor(
    dimension:
      "attempts" | "cost" | Exclude<keyof Usage, "complete" | "models">,
    limit: number,
    observed: number,
  );
}
```

## Related contracts

- [Usage](../usage/)
