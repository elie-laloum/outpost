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

Error identifying the attempt or token dimension whose admission limit was reached. limit and observed report the configured threshold and current accounting; observed model usage is not a billing cap.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name        | Type                        | Presence | Meaning                                                                           |
| ----------- | --------------------------- | -------- | --------------------------------------------------------------------------------- |
| `dimension` | `"attempts" \| keyof Usage` | Required | Budget dimension whose admission limit was exceeded: attempts or a token counter. |
| `limit`     | `number`                    | Required | Configured admission threshold for the exceeded budget dimension.                 |
| `observed`  | `number`                    | Required | Current cumulative amount observed for the exceeded budget dimension.             |
| `name`      | `string`                    | Required | Error class name used to distinguish this failure from other JavaScript errors.   |
| `message`   | `string`                    | Required | Human-readable explanation of the failure.                                        |
| `stack`     | `string \| undefined`       | Optional | JavaScript stack trace for the error, when available.                             |
| `cause`     | `unknown`                   | Optional | Original failure attached to this error.                                          |

## Signature

```ts
export declare class WorkflowBudgetExceeded extends Error {
  readonly dimension: "attempts" | keyof Usage;
  readonly limit: number;
  readonly observed: number;
  constructor(
    dimension: "attempts" | keyof Usage,
    limit: number,
    observed: number,
  );
}
```

## Related contracts

- [Usage](../usage/)
