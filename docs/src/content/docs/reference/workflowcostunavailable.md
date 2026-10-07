---
title: "WorkflowCostUnavailable"
description: "WorkflowCostUnavailable — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { WorkflowCostUnavailable } from "@elie-laloum/outpost";
```

## Purpose and behavior

Raised when a cost budget cannot measure every reported token because usage, model attribution or a matching price is missing. Stops running attempts even if an attempt limit exists; workflow terminationCode is usage-unavailable.

[Complete example and detailed rules](../../guide/budgets/).

## Parameters and properties

| Name        | Type                  | Presence | Meaning                                                                                     |
| ----------- | --------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `dimension` | `"cost"`              | Optional | Always cost, identifying unavailable monetary accounting.                                   |
| `name`      | `string`              | Required | Error class name used to distinguish this failure from other JavaScript errors.             |
| `message`   | `string`              | Required | Human-readable explanation of the failure.                                                  |
| `stack`     | `string \| undefined` | Optional | JavaScript stack trace for the error, when available.                                       |
| `cause`     | `unknown`             | Optional | Underlying failure this error wraps; quotaFault() and unavailableFault() follow this chain. |

## Signature

```ts
export declare class WorkflowCostUnavailable extends Error {
  readonly dimension = "cost";
  constructor();
}
```
