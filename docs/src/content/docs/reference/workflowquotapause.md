---
title: "WorkflowQuotaPause"
description: "WorkflowQuotaPause — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowQuotaPause } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                  | Presence | Meaning                                                                                                                 |
| -------------- | --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `requestedAt`  | `string`              | Required | ISO timestamp when the quota error paused the task.                                                                     |
| `message`      | `string`              | Required | Quota message reported by the agent or model provider.                                                                  |
| `resetAt`      | `string \| undefined` | Optional | ISO timestamp at which the limit resets, when the provider reported it; absent resets resume on the next start().       |
| `conversation` | `string \| undefined` | Optional | Conversation of the interrupted attempt, recorded only when it was captured and can be restored in a new sandbox.       |
| `branch`       | `string \| undefined` | Optional | Work branch retained by the interrupted attempt, used to start an integrated isolated dispatch from its committed work. |

## Signature

```ts
export interface WorkflowQuotaPause {
  readonly requestedAt: string;
  readonly message: string;
  readonly resetAt?: string;
  /** Captured conversation of the interrupted attempt, portable to a new sandbox. */
  readonly conversation?: string;
  /** Retained work branch of the interrupted attempt. */
  readonly branch?: string;
}
```
