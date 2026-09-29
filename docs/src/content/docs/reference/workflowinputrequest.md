---
title: "WorkflowInputRequest"
description: "WorkflowInputRequest — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowInputRequest } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                             | Presence | Meaning                                                                                   |
| --------------- | -------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `id`            | `string`                         | Required | Unique identifier of this persisted question, required when submitting its answer.        |
| `executionId`   | `string`                         | Required | Workflow execution owning this pending request.                                           |
| `key`           | `string`                         | Required | Key of the task suspended on this request.                                                |
| `requestedAt`   | `string`                         | Required | ISO timestamp when the question was created.                                              |
| `question`      | `string`                         | Required | Nonempty human-readable question to display to the respondent.                            |
| `choices`       | `readonly string[] \| undefined` | Optional | Nonempty list of unique answer choices.                                                   |
| `allowFreeText` | `boolean \| undefined`           | Optional | Whether answers outside choices are accepted; omitted means true. False requires choices. |

## Signature

```ts
export interface WorkflowInputRequest extends WorkflowInputQuestion {
  readonly id: string;
  readonly executionId: string;
  readonly key: string;
  readonly requestedAt: string;
}
```

## Related contracts

- [WorkflowInputQuestion](../workflowinputquestion/)
