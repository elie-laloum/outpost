---
title: "WorkflowResult"
description: "WorkflowResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowResult**. See the [workflows guide](../../guide/workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowResult } from "@elie-laloum/outpost";
```

## Purpose and behavior

Compose tasks with explicit dependency edges and typed result access.

Duplicate keys, missing dependencies and cycles fail validation. Failed or skipped dependencies skip descendants. Retries can repeat external effects. Unwrap throws on a non-successful result.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name             | Type                                            | Presence | Meaning                                                                 |
| ---------------- | ----------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `executionId`    | `string`                                        | Required | See the linked contract and this family's rules for its interpretation. |
| `name`           | `string`                                        | Required | See the linked contract and this family's rules for its interpretation. |
| `status`         | `"done" \| "failed" \| "cancelled" \| "paused"` | Required | Recorded process or lifecycle outcome; inspect its declared type.       |
| `tasks`          | `readonly Readonly<TaskRecord>[]`               | Required | See the linked contract and this family's rules for its interpretation. |
| `errors`         | `readonly unknown[]`                            | Required | See the linked contract and this family's rules for its interpretation. |
| `observerErrors` | `readonly unknown[]`                            | Required | See the linked contract and this family's rules for its interpretation. |
| `usage`          | `WorkflowUsage`                                 | Required | Reported usage counters; not a currency estimate.                       |
| `value`          | `<T>(task: Task<T>) => T`                       | Required | Typed value produced or consumed by this contract.                      |
| `unwrap`         | `() => void`                                    | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface WorkflowResult {
  readonly executionId: string;
  readonly name: string;
  readonly status: "done" | "failed" | "cancelled" | "paused";
  readonly tasks: readonly Readonly<TaskRecord>[];
  readonly errors: readonly unknown[];
  readonly observerErrors: readonly unknown[];
  readonly usage: WorkflowUsage;
  value<T>(task: Task<T>): T;
  unwrap(): void;
}
```

## Related contracts

- [Task](../task/)
- [TaskRecord](../taskrecord/)
- [WorkflowUsage](../workflowusage/)
