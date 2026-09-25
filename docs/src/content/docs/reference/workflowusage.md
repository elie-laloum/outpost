---
title: "WorkflowUsage"
description: "WorkflowUsage — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowUsage } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type     | Presence | Meaning                                                                                  |
| ---------- | -------- | -------- | ---------------------------------------------------------------------------------------- |
| `attempts` | `number` | Required | Cumulative number of admitted task attempts across the workflow.                         |
| `tokens`   | `Usage`  | Required | Cumulative observed token usage across workflow attempts, including restored accounting. |

## Signature

```ts
export interface WorkflowUsage {
  readonly attempts: number;
  readonly tokens: Usage;
}
```

## Related contracts

- [Usage](../usage/)
