---
title: "WorkflowUsageUnavailable"
description: "WorkflowUsageUnavailable — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { WorkflowUsageUnavailable } from "@elie-laloum/outpost";
```

## Purpose and behavior

Error recorded when reported usage is marked incomplete while the budget sets token limits without attempts. It fails the run and cancels running and pending tasks; set budget.attempts to keep a bounded fallback.

[Complete example and detailed rules](../../guide/budgets/).

## Parameters and properties

| Name        | Type                  | Presence | Meaning                                                                                     |
| ----------- | --------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `dimension` | `"usage"`             | Optional | Always usage: token accounting is incomplete and the budget has no attempt fallback.        |
| `name`      | `string`              | Required | Stable error name WorkflowUsageUnavailable.                                                 |
| `message`   | `string`              | Required | Human-readable explanation of the failure.                                                  |
| `stack`     | `string \| undefined` | Optional | JavaScript stack trace for the error, when available.                                       |
| `cause`     | `unknown`             | Optional | Underlying failure this error wraps; quotaFault() and unavailableFault() follow this chain. |

## Signature

```ts
export declare class WorkflowUsageUnavailable extends Error {
  readonly dimension = "usage";
  constructor();
}
```
