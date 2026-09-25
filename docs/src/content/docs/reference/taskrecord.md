---
title: "TaskRecord"
description: "TaskRecord — Outpost API"
sidebar:
  order: 10
---

Public contract for **TaskRecord**. See the [workflows guide](../../guide/workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import type { TaskRecord } from "@elie-laloum/outpost";
```

## Purpose and behavior

Compose tasks with explicit dependency edges and typed result access.

Duplicate keys, missing dependencies and cycles fail validation. Failed or skipped dependencies skip descendants. Retries can repeat external effects. Unwrap throws on a non-successful result.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name            | Type                                  | Presence | Meaning                                                                 |
| --------------- | ------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `usageReceipts` | `readonly string[] \| undefined`      | Optional | See the linked contract and this family's rules for its interpretation. |
| `pause`         | `WorkflowPauseRequest \| undefined`   | Optional | See the linked contract and this family's rules for its interpretation. |
| `decision`      | `WorkflowDecisionRecord \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `key`           | `string`                              | Required | Stable task or cache key within its owning contract.                    |
| `status`        | `TaskStatus`                          | Required | Recorded process or lifecycle outcome; inspect its declared type.       |
| `attempts`      | `number`                              | Required | Attempt count or admission limit, according to the owning contract.     |
| `startedAt`     | `string \| undefined`                 | Optional | See the linked contract and this family's rules for its interpretation. |
| `finishedAt`    | `string \| undefined`                 | Optional | See the linked contract and this family's rules for its interpretation. |
| `error`         | `string \| undefined`                 | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface TaskRecord {
  usageReceipts?: readonly string[];
  pause?: WorkflowPauseRequest;
  decision?: WorkflowDecisionRecord;
  readonly key: string;
  status: TaskStatus;
  attempts: number;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
}
```

## Related contracts

- [TaskStatus](../taskstatus/)
- [WorkflowDecisionRecord](../workflowdecisionrecord/)
- [WorkflowPauseRequest](../workflowpauserequest/)
