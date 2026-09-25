---
title: "WorkflowEvent"
description: "WorkflowEvent — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowEvent**. See the [workflows guide](../../guide/workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowEvent } from "@elie-laloum/outpost";
```

## Purpose and behavior

Compose tasks with explicit dependency edges and typed result access.

Duplicate keys, missing dependencies and cycles fail validation. Failed or skipped dependencies skip descendants. Retries can repeat external effects. Unwrap throws on a non-successful result.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name          | Type                                                               | Presence | Meaning                                                                 |
| ------------- | ------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------- |
| `executionId` | `string`                                                           | Required | See the linked contract and this family's rules for its interpretation. |
| `workflow`    | `string`                                                           | Required | See the linked contract and this family's rules for its interpretation. |
| `timestamp`   | `string`                                                           | Required | See the linked contract and this family's rules for its interpretation. |
| `type`        | `"usage" \| "retry" \| "start" \| "task" \| "attempt" \| "finish"` | Required | See the linked contract and this family's rules for its interpretation. |
| `key`         | `string \| undefined`                                              | Optional | Stable task or cache key within its owning contract.                    |
| `status`      | `TaskStatus \| undefined`                                          | Optional | Recorded process or lifecycle outcome; inspect its declared type.       |
| `attempt`     | `number \| undefined`                                              | Optional | See the linked contract and this family's rules for its interpretation. |
| `usage`       | `Usage \| undefined`                                               | Optional | Reported usage counters; not a currency estimate.                       |
| `durationMs`  | `number \| undefined`                                              | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface WorkflowEvent {
  readonly executionId: string;
  readonly workflow: string;
  readonly timestamp: string;
  readonly type: "start" | "task" | "attempt" | "retry" | "usage" | "finish";
  readonly key?: string;
  readonly status?: TaskStatus;
  readonly attempt?: number;
  readonly usage?: Usage;
  readonly durationMs?: number;
}
```

## Related contracts

- [TaskStatus](../taskstatus/)
- [Usage](../usage/)
