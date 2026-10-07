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

| Name       | Type                     | Presence | Meaning                                                                                                                                                                 |
| ---------- | ------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `attempts` | `number`                 | Required | Cumulative number of admitted task attempts across the workflow.                                                                                                        |
| `tokens`   | `Usage`                  | Required | Cumulative observed token usage across workflow attempts, including restored accounting.                                                                                |
| `cost`     | `UsageCost \| undefined` | Optional | Estimate computed from cumulative saved model counters and the configured table; absent without prices. Resume recomputes historical estimates with the supplied table. |

## Signature

```ts
export interface WorkflowUsage {
  readonly attempts: number;
  readonly tokens: Usage;
  readonly cost?: UsageCost;
}
```

## Related contracts

- [Usage](../usage/)
- [UsageCost](../usagecost/)
