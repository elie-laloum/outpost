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

| Name          | Type                  | Presence | Meaning                                                                                                           |
| ------------- | --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `requestedAt` | `string`              | Required | ISO timestamp when the quota error paused the task.                                                               |
| `message`     | `string`              | Required | Quota message reported by the agent or model provider.                                                            |
| `resetAt`     | `string \| undefined` | Optional | ISO timestamp at which the limit resets, when the provider reported it; absent resets resume on the next start(). |

## Signature

```ts
export interface WorkflowQuotaPause {
  readonly requestedAt: string;
  readonly message: string;
  readonly resetAt?: string;
}
```
