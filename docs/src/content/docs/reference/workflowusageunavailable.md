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

Error reported when incomplete token accounting makes a token-only workflow or speculation budget unenforceable. Configure budget.attempts and execution time limits to allow bounded fallback. Its usage dimension cancels admitted work and prevents retries.

[Complete example and detailed rules](../../guide/budgets/).

## Parameters and properties

| Name        | Type                  | Presence | Meaning                                                                              |
| ----------- | --------------------- | -------- | ------------------------------------------------------------------------------------ |
| `dimension` | `"usage"`             | Optional | Always usage: token accounting is incomplete and the budget has no attempt fallback. |
| `name`      | `string`              | Required | Stable error name WorkflowUsageUnavailable.                                          |
| `message`   | `string`              | Required | Human-readable explanation of the failure.                                           |
| `stack`     | `string \| undefined` | Optional | JavaScript stack trace for the error, when available.                                |
| `cause`     | `unknown`             | Optional | Original failure attached to this error.                                             |

## Signature

```ts
export declare class WorkflowUsageUnavailable extends Error {
  readonly dimension = "usage";
  constructor();
}
```
